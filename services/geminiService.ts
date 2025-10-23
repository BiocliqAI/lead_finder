import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ApiResponse, GroundingSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const findCentersAndSpecialists = async (
  city: string,
  numberOfCenters: string,
  specialties: string[],
  userLocation: { latitude: number; longitude: number } | null,
  onStatusUpdate: (message: string) => void
): Promise<ApiResponse> => {
  const numberOfCentersText = `the top ${numberOfCenters}`;
  const specialtiesListText = specialties.join(', ');
  const specialtiesJsonDefinition = specialties.map(s => `        "${s.toLowerCase()}": [ { "name": "string", "address": "string", "phone": "string" } ]`).join(',\n');

  const locationText = city
    ? `in the city of "${city}"`
    : `within a 5km radius of the user's current location`;

  const prompt = `
    **Primary Goal:** Find diagnostic centers and nearby medical specialists, then format the output as a single JSON object.

    **Instructions:**
    1.  **Find Diagnostic Centers:** Search for ${numberOfCentersText} diagnostic centers ${locationText}.
    2.  **Required Amenity:** Each center found MUST have a CT machine.
    3.  **Find Nearby Specialists (for each center):** For every diagnostic center you find, search for specialists within a 5km radius in these categories: ${specialtiesListText}.
    4.  **Handle Missing Specialists:** If you cannot find any specialists for a specific category at a center, you MUST return an empty array \`[]\` for that specialty.

    **CRITICAL: Output Format**
    - Your entire response MUST be ONLY the JSON object. Do not include any other text, explanations, or markdown fences.
    - The JSON object must strictly follow this structure:
    {
      "diagnosticCenters": [
        {
          "name": "string",
          "address": "string",
          "contactDetails": {
            "phone": "string",
            "website": "string"
          },
          "googleRating": 4.5,
          "userReviewSummary": "A brief summary of what people say in reviews.",
          "hasCTMachine": true,
          "nearbySpecialists": {
${specialtiesJsonDefinition}
          }
        }
      ]
    }
  `;

  let response: GenerateContentResponse | undefined;

  const statusUpdateLocationText = city ? `in ${city}` : `near you`;

  try {
    onStatusUpdate(`Finding ${numberOfCentersText} diagnostic centers with CT machines ${statusUpdateLocationText}...`);
    response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        ...(userLocation && {
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
            },
          },
        }),
      },
    });

    onStatusUpdate('Parsing AI response...');
    let jsonText = response.text;

    // The model response might be wrapped in markdown ```json ... ``` or just be a raw JSON string.
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1];
    } else {
      // Fallback for cases where it's not in a markdown block but might have surrounding text.
      const startIndex = jsonText.indexOf('{');
      const endIndex = jsonText.lastIndexOf('}');
      if (startIndex > -1 && endIndex > -1) {
        jsonText = jsonText.substring(startIndex, endIndex + 1);
      }
    }

    const parsedData = JSON.parse(jsonText);

    onStatusUpdate('Extracting data sources...');
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingSources: GroundingSource[] = [];
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web) {
          groundingSources.push({ uri: chunk.web.uri, title: chunk.web.title, type: 'web' });
        }
        if (chunk.maps) {
          groundingSources.push({ uri: chunk.maps.uri, title: chunk.maps.title, type: 'maps' });
        }
      }
    }
    
    // Deduplicate sources
    const uniqueSources = Array.from(new Map(groundingSources.map(item => [item.uri, item])).values());
    
    onStatusUpdate('Compiling results...');

    return { diagnosticCenters: parsedData.diagnosticCenters || [], groundingSources: uniqueSources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let userFriendlyError = "An unknown error occurred. Please try again.";
    
    if (error instanceof SyntaxError) {
        console.error("Failed to parse JSON from response:", response?.text);
        userFriendlyError = "The response from the AI was not in a valid format. This may be due to the complexity of the request. Try reducing the number of centers or specialties.";
    } else {
        const errorString = (error instanceof Error) ? error.message : JSON.stringify(error);
        if (errorString.includes("Internal error encountered") || errorString.includes("500") || errorString.includes("xhr error")) {
           userFriendlyError = "The AI model encountered an internal error, likely due to the request's complexity. Please try searching for fewer centers or a different city.";
        } else if (error instanceof Error) {
           userFriendlyError = error.message;
        }
    }
    throw new Error(userFriendlyError);
  }
};