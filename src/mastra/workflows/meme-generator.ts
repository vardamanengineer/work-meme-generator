import {createWorkflow} from '@mastra/core/workflows'
import {z} from 'zod'
import {
    extractFrustrationsStep,
    findBaseMemeStep,
    generateCaptionStep,
    generateMemeStep
} from './steps'

export const memeGenerationWorkflow = createWorkflow({
    id: 'meme-generation',
    description: 'Complete workflow to generate memes for workplace frustrations',
    inputSchema: z.object({
        userInput: z.string().describe('Raw user input about work frustration')
    }),
    outputSchema: z.object({
        shareableUrl: z.string(),
        pageUrl: z.string().optional(),
        analysis: z.object({
            message: z.string()
        })
    }),
    steps: [
        extractFrustrationsStep,
        findBaseMemeStep,
        generateCaptionStep,
        generateMemeStep
    ]
})

memeGenerationWorkflow
    .then(extractFrustrationsStep)
    .then(findBaseMemeStep)
    .map({
        frustrations: {
            step: extractFrustrationsStep,
            path: '.'
        },
        baseTemplate: {
            step: findBaseMemeStep,
            path: 'templates.0'
        }
    })
    .then(generateCaptionStep)
    .map({
        baseTemplate: {
            step: findBaseMemeStep,
            path: 'templates.0'
        },
        captions: {
            step: generateCaptionStep,
            path: '.'
        }
    })
    .then(generateMemeStep)
    .map({
        shareableUrl: {
            step: generateMemeStep,
            path: 'imageUrl'
        },
        pageUrl: {
            step: generateMemeStep,
            path: 'pageUrl'
        },
        analysis: {
            step: generateMemeStep,
            path: 'analysis'
        }
    })
    .commit()