import { Mastra } from '@mastra/core';
import { storage } from './memory';
import { memeGenerationWorkflow } from './workflows/meme-generator';
import { memeGeneratorAgent } from './agents/meme-generator';

export const mastra = new Mastra({
  storage,
  agents: {
    'memeGenerator': memeGeneratorAgent
  },
  workflows: {
    'meme-generation':memeGenerationWorkflow
  },
  telemetry: {
    enabled: true,
  },
});