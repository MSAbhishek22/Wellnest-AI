import { storage } from "../storage";
import { ExternalAPIService } from "../services/external-apis";
import type { AgentMemory, InsertAgentMemory } from "@shared/schema";

// ADK-Inspired Agent Development Kit Base Class
export abstract class EnhancedBaseAgent {
  protected name: string;
  protected role: string;
  protected tools: string[];
  protected capabilities: string[];
  protected mustDoTasks: string[];

  constructor(
    name: string, 
    role: string, 
    tools: string[] = [], 
    capabilities: string[] = [],
    mustDoTasks: string[] = []
  ) {
    this.name = name;
    this.role = role;
    this.tools = tools;
    this.capabilities = capabilities;
    this.mustDoTasks = mustDoTasks;
  }

  // ===== ADK-INSPIRED CORE METHODS =====

  /**
   * PLAN: Analyze user input and create execution plan
   */
  protected async plan(userInput: any, context: any): Promise<AgentPlan> {
    const userIntent = await this.analyzeUserIntent(userInput);
    const contextAnalysis = await this.analyzeContext(context);
    const availableActions = this.getAvailableActions();
    
    return {
      intent: userIntent,
      context: contextAnalysis,
      actions: this.prioritizeActions(availableActions, userIntent),
      expectedOutcome: this.predictOutcome(userIntent, availableActions),
      riskAssessment: this.assessRisks(userIntent, contextAnalysis)
    };
  }

  /**
   * THINK: Process information and make intelligent decisions
   */
  protected async think(plan: AgentPlan, userContext: any): Promise<AgentThought> {
    const reasoning = await this.performReasoning(plan, userContext);
    const alternatives = await this.considerAlternatives(plan);
    const bestApproach = await this.selectBestApproach(reasoning, alternatives);
    
    return {
      reasoning,
      alternatives,
      selectedApproach: bestApproach,
      confidence: this.calculateConfidence(bestApproach, plan),
      safeguards: this.identifySafeguards(bestApproach, plan.riskAssessment)
    };
  }

  /**
   * EXECUTE: Perform actions based on plan and thinking
   */
  protected async execute(thought: AgentThought, plan: AgentPlan, userId: number): Promise<AgentExecution> {
    const executionSteps = thought.selectedApproach.steps;
    const results = [];
    
    for (const step of executionSteps) {
      try {
        const stepResult = await this.executeStep(step, userId);
        results.push(stepResult);
        
        // Health check after each step
        if (!this.validateStepResult(stepResult, step)) {
          throw new Error(`Step validation failed: ${step.name}`);
        }
      } catch (error) {
        console.error(`Execution error in step ${step.name}:`, error);
        results.push({ step: step.name, error: String(error), success: false });
      }
    }
    
    return {
      results,
      success: results.every(r => r.success !== false),
      output: await this.generateOutput(results, plan),
      collaborationTriggers: this.identifyCollaborationNeeds(results, plan),
      memoryUpdates: await this.prepareMemoryUpdates(results, userId)
    };
  }

  /**
   * Main run method that orchestrates PLAN -> THINK -> EXECUTE
   */
  async run(input: any, userId: number): Promise<any> {
    try {
      // Get user context and agent memory
      const userContext = await this.getUserContext(userId);
      const agentMemory = await this.getMemory(userId);
      
      // PLAN Phase
      const plan = await this.plan(input, { userContext, agentMemory });
      console.log(`[${this.name}] PLAN:`, plan.intent.summary);
      
      // THINK Phase  
      const thought = await this.think(plan, userContext);
      console.log(`[${this.name}] THINK:`, thought.selectedApproach.name);
      
      // EXECUTE Phase
      const execution = await this.execute(thought, plan, userId);
      console.log(`[${this.name}] EXECUTE:`, execution.success ? 'SUCCESS' : 'PARTIAL');
      
      // Update memory with execution results
      if (execution.memoryUpdates) {
        await this.updateMemory(userId, execution.memoryUpdates);
      }
      
      return {
        agentName: this.name,
        success: execution.success,
        output: execution.output,
        collaborationTriggers: execution.collaborationTriggers,
        plan: plan.intent.summary,
        confidence: thought.confidence,
        memory: execution.memoryUpdates
      };
      
    } catch (error) {
      console.error(`[${this.name}] Critical error:`, error);
      return {
        agentName: this.name,
        success: false,
        output: await this.generateErrorResponse(error, input),
        collaborationTriggers: [],
        error: String(error)
      };
    }
  }

  // ===== ABSTRACT METHODS (Must be implemented by each agent) =====
  
  abstract analyzeUserIntent(userInput: any): Promise<UserIntent>;
  abstract getAvailableActions(): AgentAction[];
  abstract executeStep(step: ExecutionStep, userId: number): Promise<StepResult>;
  abstract generateOutput(results: StepResult[], plan: AgentPlan): Promise<any>;
  abstract generateErrorResponse(error: any, input: any): Promise<string>;

  // ===== HELPER METHODS =====

  protected async analyzeContext(context: any): Promise<ContextAnalysis> {
    return {
      userMood: context.userContext?.currentMood || 'neutral',
      recentActivity: context.agentMemory?.recentActivity || [],
      healthStatus: context.userContext?.healthStatus || 'unknown',
      preferences: context.userContext?.preferences || {},
      riskFactors: this.identifyRiskFactors(context)
    };
  }

  protected prioritizeActions(actions: AgentAction[], intent: UserIntent): AgentAction[] {
    return actions
      .filter(action => this.isActionRelevant(action, intent))
      .sort((a, b) => this.calculateActionPriority(b, intent) - this.calculateActionPriority(a, intent));
  }

  protected predictOutcome(intent: UserIntent, actions: AgentAction[]): string {
    const primaryAction = actions[0];
    return primaryAction ? 
      `Expected to ${primaryAction.description} with ${intent.confidence * 100}% confidence` :
      'No suitable actions identified';
  }

  protected assessRisks(intent: UserIntent, context: ContextAnalysis): RiskAssessment {
    const risks = [];
    
    // Health-related risk assessment
    if (intent.category === 'health' && context.healthStatus === 'concerning') {
      risks.push({ level: 'high', description: 'Health concern detected', mitigation: 'Recommend professional consultation' });
    }
    
    if (intent.urgency === 'high' && intent.confidence < 0.7) {
      risks.push({ level: 'medium', description: 'High urgency with low confidence', mitigation: 'Request clarification' });
    }
    
    return {
      overallLevel: risks.length > 0 ? Math.max(...risks.map(r => r.level === 'high' ? 3 : r.level === 'medium' ? 2 : 1)) : 1,
      risks,
      safeguardsRequired: risks.length > 0
    };
  }

  protected async performReasoning(plan: AgentPlan, userContext: any): Promise<string> {
    const reasoning = [
      `User intent: ${plan.intent.summary}`,
      `Context: ${plan.context.userMood} mood, ${plan.context.healthStatus} health status`,
      `Available actions: ${plan.actions.length} options identified`,
      `Risk level: ${plan.riskAssessment.overallLevel}/3`
    ];
    
    return reasoning.join('. ');
  }

  protected async considerAlternatives(plan: AgentPlan): Promise<Alternative[]> {
    return plan.actions.slice(0, 3).map((action, index) => ({
      name: action.name,
      description: action.description,
      pros: action.benefits || [],
      cons: action.risks || [],
      feasibility: this.calculateFeasibility(action, plan)
    }));
  }

  protected async selectBestApproach(reasoning: string, alternatives: Alternative[]): Promise<SelectedApproach> {
    const bestAlternative = alternatives.reduce((best, current) => 
      current.feasibility > best.feasibility ? current : best
    );
    
    return {
      name: bestAlternative.name,
      description: bestAlternative.description,
      steps: this.generateExecutionSteps(bestAlternative),
      estimatedDuration: this.estimateDuration(bestAlternative),
      successProbability: bestAlternative.feasibility
    };
  }

  protected calculateConfidence(approach: SelectedApproach, plan: AgentPlan): number {
    const baseConfidence = approach.successProbability;
    const intentConfidence = plan.intent.confidence;
    const riskPenalty = plan.riskAssessment.overallLevel * 0.1;
    
    return Math.max(0.1, Math.min(1.0, (baseConfidence + intentConfidence) / 2 - riskPenalty));
  }

  protected identifySafeguards(approach: SelectedApproach, riskAssessment: RiskAssessment): string[] {
    const safeguards = [];
    
    if (riskAssessment.overallLevel >= 2) {
      safeguards.push('Validate user input before proceeding');
      safeguards.push('Monitor execution for unexpected results');
    }
    
    if (approach.successProbability < 0.7) {
      safeguards.push('Provide alternative options if primary approach fails');
    }
    
    return safeguards;
  }

  protected validateStepResult(result: StepResult, step: ExecutionStep): boolean {
    // A step is valid if it explicitly succeeded or if it didn't explicitly fail
    return result.success !== false;
  }

  protected identifyCollaborationNeeds(results: StepResult[], plan: AgentPlan): string[] {
    const triggers = [];
    
    // Analyze results to determine if other agents should be involved
    if (plan.intent.category === 'mood' && plan.context.userMood === 'stressed') {
      triggers.push('NutriCoach', 'FlexGenie', 'MindPal');
    }
    
    return triggers;
  }

  protected async prepareMemoryUpdates(results: StepResult[], userId: number): Promise<any> {
    const currentMemory = await this.getMemory(userId);
    
    return {
      ...currentMemory,
      lastExecution: {
        timestamp: new Date(),
        results: results.map(r => ({ step: r.step, success: r.success })),
        success: results.every(r => r.success !== false)
      },
      executionCount: (currentMemory.executionCount || 0) + 1
    };
  }

  // ===== UTILITY METHODS =====

  protected isActionRelevant(action: AgentAction, intent: UserIntent): boolean {
    return action.categories.some(cat => intent.categories.includes(cat));
  }

  protected calculateActionPriority(action: AgentAction, intent: UserIntent): number {
    let priority = action.basePriority || 0.5;
    
    // Boost priority for must-do tasks
    if (this.mustDoTasks.includes(action.name)) {
      priority += 0.3;
    }
    
    // Boost priority for matching categories
    const categoryMatch = action.categories.filter(cat => intent.categories.includes(cat)).length;
    priority += categoryMatch * 0.1;
    
    return priority;
  }

  protected calculateFeasibility(action: AgentAction, plan: AgentPlan): number {
    let feasibility = 0.8; // Base feasibility
    
    // Reduce feasibility for high-risk scenarios
    if (plan.riskAssessment.overallLevel >= 3) {
      feasibility -= 0.2;
    }
    
    // Increase feasibility for actions with required tools
    if (action.requiredTools && action.requiredTools.every(tool => this.tools.includes(tool))) {
      feasibility += 0.1;
    }
    
    return Math.max(0.1, Math.min(1.0, feasibility));
  }

  protected generateExecutionSteps(alternative: Alternative): ExecutionStep[] {
    // Default implementation - agents should override for specific steps
    return [
      {
        name: 'prepare',
        description: 'Prepare for execution',
        requiredData: ['userInput'],
        expectedOutput: 'preparation_complete'
      },
      {
        name: 'execute_main',
        description: alternative.description,
        requiredData: ['preparation_complete'],
        expectedOutput: 'main_result'
      },
      {
        name: 'finalize',
        description: 'Finalize and format output',
        requiredData: ['main_result'],
        expectedOutput: 'final_output'
      }
    ];
  }

  protected estimateDuration(alternative: Alternative): number {
    // Default estimation in seconds
    return 5;
  }

  protected identifyRiskFactors(context: any): string[] {
    const risks = [];
    
    if (context.userContext?.currentMood === 'depressed') {
      risks.push('mental_health_concern');
    }
    
    if (context.userContext?.healthStatus === 'critical') {
      risks.push('physical_health_concern');
    }
    
    return risks;
  }

  // ===== MEMORY AND CONTEXT METHODS =====

  async getMemory(userId: number): Promise<any> {
    const memory = await storage.getAgentMemory(userId, this.name);
    return memory?.memoryData || {};
  }

  async updateMemory(userId: number, memoryData: any): Promise<void> {
    const memoryEntry: InsertAgentMemory = {
      userId,
      agentName: this.name,
      memoryData
    };
    await storage.updateAgentMemory(memoryEntry);
  }

  protected async getUserContext(userId: number): Promise<any> {
    try {
      const [user, recentMoods, recentJournals] = await Promise.all([
        storage.getUser(userId),
        storage.getMoodEntries(userId, 5),
        storage.getJournalEntries(userId, 3)
      ]);

      return {
        currentMood: user?.currentMood || 'neutral',
        streakDays: user?.streakDays || 0,
        recentMoods: recentMoods?.map((entry: any) => entry.mood) || [],
        recentJournalThemes: recentJournals?.map((entry: any) => 
          entry.content?.substring(0, 100)
        ) || [],
        healthStatus: 'normal', // Could be enhanced with health data
        preferences: {}
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return { currentMood: 'neutral', healthStatus: 'unknown' };
    }
  }

  async observe(agentOutput: any, userId: number): Promise<void> {
    const memory = await this.getMemory(userId);
    const observations = memory.observations || [];
    
    observations.push({
      timestamp: new Date(),
      agent: agentOutput.agentName,
      outputSummary: {
        type: agentOutput.agentName,
        success: agentOutput.success,
        hasRecommendations: !!agentOutput.output?.recommendations,
        collaborationTriggered: agentOutput.collaborationTriggers?.length > 0
      },
      context: "collaboration"
    });

    // Keep only last 10 observations
    if (observations.length > 10) {
      observations.splice(0, observations.length - 10);
    }

    await this.updateMemory(userId, { ...memory, observations });
  }

  // ===== GETTERS =====

  getName(): string { return this.name; }
  getRole(): string { return this.role; }
  getTools(): string[] { return this.tools; }
  getCapabilities(): string[] { return this.capabilities; }
  getMustDoTasks(): string[] { return this.mustDoTasks; }
}

// ===== TYPE DEFINITIONS =====

export interface UserIntent {
  summary: string;
  categories: string[];
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
  entities: string[];
  category: string;
}

export interface ContextAnalysis {
  userMood: string;
  recentActivity: any[];
  healthStatus: string;
  preferences: any;
  riskFactors: string[];
}

export interface AgentAction {
  name: string;
  description: string;
  categories: string[];
  basePriority?: number;
  requiredTools?: string[];
  benefits?: string[];
  risks?: string[];
}

export interface RiskAssessment {
  overallLevel: number;
  risks: Array<{
    level: string;
    description: string;
    mitigation: string;
  }>;
  safeguardsRequired: boolean;
}

export interface AgentPlan {
  intent: UserIntent;
  context: ContextAnalysis;
  actions: AgentAction[];
  expectedOutcome: string;
  riskAssessment: RiskAssessment;
}

export interface Alternative {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  feasibility: number;
}

export interface ExecutionStep {
  name: string;
  description: string;
  requiredData: string[];
  expectedOutput: string;
}

export interface SelectedApproach {
  name: string;
  description: string;
  steps: ExecutionStep[];
  estimatedDuration: number;
  successProbability: number;
}

export interface AgentThought {
  reasoning: string;
  alternatives: Alternative[];
  selectedApproach: SelectedApproach;
  confidence: number;
  safeguards: string[];
}

export interface StepResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface AgentExecution {
  results: StepResult[];
  success: boolean;
  output: any;
  collaborationTriggers: string[];
  memoryUpdates: any;
}
