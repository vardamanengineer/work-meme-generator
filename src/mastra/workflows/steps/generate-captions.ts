import {createStep} from '@mastra/core/workflows';
import {z} from 'zod'
import { frustrationsSchema, memeTemplateSchema, captionsSchema } from '../schemas';
import {generateObject} from 'ai'
import {createOpenAI} from '@ai-sdk/openai'

const llm = createOpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
})

export const generateCaptionStep = createStep({
    id:'generate-captions',
    description: 'Generate funny captions based on frustractions and meme template',
    inputSchema: z.object({
        frustrations: frustrationsSchema,
        baseTemplate: memeTemplateSchema
    }),
    outputSchema: captionsSchema,
    execute: async ({inputData}) => {
        try{
            console.log('Generating captions for `${inputData.baseTemplate.name}` meme...')
            const mainFrustration = inputData.frustrations.frustrations[0]
            const mood = inputData.frustrations.overallMood
            const result = await generateObject({
                model: llm('gpt-5-nano'),
                schema: captionsSchema,
                prompt: `
                Create meme captions for the "${inputData.baseTemplate.name}" meme template .
                Context:
                - Frustration: ${mainFrustration.text}
                - Category: ${mainFrustration.category}
                - Mood: ${mood}
                - Meme has ${inputData.baseTemplate.box_count} text boxes

                Make it funny and relatable to office workers. The humor should match the ${mood} mood.
                Keep text concise for meme format. Be creative but workplacte-appropriate.
                `
            })
            console.log('Captions generated successfully')
            return result.object;
        }
        catch(error){
            console.log('Error generating captions')
            throw new Error('Error generating captions')
        }
    }
})