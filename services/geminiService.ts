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
  const numberOfCentersText = numberOfCenters === 'all' ? 'all available' : `the top ${numberOfCenters}`;
  const specialtiesListText = specialties.join(', ');
  const specialtiesJsonDefinition = specialties.map(s => `"${s.toLowerCase()}": [ { "name": "string", "address": "string", "phone": "string" } ]`).join(',\n            ');

  const quantityInstruction = numberOfCenters === 'all'
    ? "For 'all available' centers, perform a comprehensive search and list as many high-quality results as you can find. Do not limit yourself to a small number like 5."
    : `Find exactly ${numberOfCenters} of the top-rated centers.`;

  const locationText = city
    ? `in "${city}"`
    : `within a 5km radius of the provided geo-coordinates`;

  const prompt = `
    You are an AI assistant that finds medical facilities and returns the data in a specific JSON format.

    **Primary Task:**
    Find ${numberOfCentersText} diagnostic centers ${locationText} that have a CT machine. ${quantityInstruction}

    **Secondary Task (MANDATORY for EACH center found):**
    For each diagnostic center, find nearby specialists in the following categories: ${specialtiesListText}. The search should be within a 5km radius of the center's address.

    **Data Requirements for each Center:**
    - name: Full name of the center.
    - address: Complete address.
    - contactDetails: phone number and website.
    - googleRating: The numerical Google rating.
    - userReviewSummary: A concise summary of user reviews.
    - hasCTMachine: Must be \`true\`.
    - nearbySpecialists: An object where each key is a specialty from the list above (in lowercase). The value for each key must be an array of specialist objects ({name, address, phone}). If no specialists are found for a category, you MUST return an empty array \`[]\`.

    **Output Format Instructions:**
    - The ENTIRE response must be a single, valid JSON object.
    - Do NOT include any text, notes, or markdown (like \`\`\`json\`) outside of the JSON structure.
    - The JSON structure MUST be:
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
          "userReviewSummary": "string",
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
      model: "gemini-2.5-flash",
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
        if (errorString.includes("Internal error encountered") || errorString.includes("500")) {
           userFriendlyError = "The AI model encountered an internal error, likely due to the request's complexity. Please try searching for fewer centers or a different city.";
        } else if (error instanceof Error) {
           userFriendlyError = error.message;
        }
    }
    throw new Error(userFriendlyError);
  }
};