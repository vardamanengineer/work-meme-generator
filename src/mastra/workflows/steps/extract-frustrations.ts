import {createStep} from '@mastra/core/workflows'
import {z} from 'zod'
import {generateObject} from 'ai'
import {createOpenAI} from '@ai-sdk/openai'
import { frustrationsSchema } from '../schemas'

const llm = createOpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
})

const extractFrustrationsOutputSchema = frustrationsSchema.extend({
    analysis: z.object({
        message: z.string()
    }),
})

export const extractFrustrationsStep = createStep({
    id:'extract-frustrations',
    description: 'Extract and categorize user frustractions from raw input using AI',
    inputSchema: z.object({
        userInput: z.string().describe('Raw user input about work frustractions')
    }),
    outputSchema: extractFrustrationsOutputSchema,
    execute: async ({inputData}) => {
        try{
            const result = await generateObject({
                model: llm('gpt-4.1-mini'),
                schema: frustrationsSchema,
                prompt: `
                    Analyze this workplace frustration and extract structured information:

                    "${inputData.userInput}"

                    Extract:
                    - Individual frustrations with categories
                    - Overall mood
                    - Keywords for each frustration
                    - Suggested meme style

                    Keep analysis concise and focused.
                    `,
            });
            const frustrations = result.object
            return {
                ...frustrations,
                analysis: {
                    message: `Analyzed your frustrations - main issue: ${frustrations.frustrations[0]?.category} (${frustrations.overallMood} mood)`,
                },
            }
        }catch(error){
            console.error('Error extracting frustrations:', error);
            throw new Error(
                `Failed to extract frustrations: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }
});