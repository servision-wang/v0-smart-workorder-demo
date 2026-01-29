// Tool definitions for OpenAI Realtime API voice commands

export interface ToolDefinition {
  type: 'function'
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required?: string[]
  }
}

// All available tools for voice control
export const toolDefinitions: ToolDefinition[] = [
  // Global navigation
  {
    type: 'function',
    name: 'click_confirm',
    description: 'Click the confirm button to proceed to the next step. Call when user says "confirm", "next", "done", "ok", "add to work order", "generate work order", "submit"',
    parameters: {
      type: 'object',
      properties: {},
    }
  },
  {
    type: 'function',
    name: 'go_back',
    description: 'Go back to the previous page. Call when user says "back", "previous", "return", "go back"',
    parameters: {
      type: 'object',
      properties: {},
    }
  },

  // Page 1: Voice Input - repair item extraction
  {
    type: 'function',
    name: 'add_repair_items',
    description: 'Extract repair parts and operations from user voice input. Call when user describes repair needs, e.g. "replace front grille", "left fender body repair and paint", "replace radiator"',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'string',
          description: 'Original repair requirements described by user, e.g. "replace front grille, radar sensor, windshield"'
        }
      },
      required: ['items']
    }
  },

  // Page 2: Recognition Results - part selection
  {
    type: 'function',
    name: 'toggle_part',
    description: 'Select or deselect a part. Call when user says "select XX", "deselect XX", "check XX", "remove XX"',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: 'Part name, e.g. front grille, windshield, hood, left headlight, left fender, radiator'
        },
        selected: {
          type: 'string',
          description: 'Selection state: true for selected, false for deselected, toggle to switch',
          enum: ['true', 'false', 'toggle']
        }
      },
      required: ['part_name']
    }
  },
  {
    type: 'function',
    name: 'set_part_action',
    description: 'Set repair action for a part (Replace, Body Repair, Paint). Call when user says "replace XX", "body repair XX", "paint XX"',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: 'Part name'
        },
        action: {
          type: 'string',
          description: 'Repair action type',
          enum: ['Replace', 'Body Repair', 'Paint']
        },
        enabled: {
          type: 'string',
          description: 'Enable or disable action: true to enable, false to disable, toggle to switch',
          enum: ['true', 'false', 'toggle']
        }
      },
      required: ['part_name', 'action']
    }
  },
  {
    type: 'function',
    name: 'select_all_parts',
    description: 'Select or deselect all parts. Call when user says "select all", "check all", "deselect all", "uncheck all"',
    parameters: {
      type: 'object',
      properties: {
        selected: {
          type: 'string',
          description: 'Selection state: true for all selected, false for all deselected',
          enum: ['true', 'false']
        }
      },
      required: ['selected']
    }
  },
  {
    type: 'function',
    name: 'open_epc',
    description: 'Open EPC parts catalogue to find replacement parts. Call when user says "find replacement", "open EPC", "find alternative for XX", "replace XX", "find XX substitute"',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: 'Part name to find replacement for, e.g. front grille, windshield'
        }
      },
      required: ['part_name']
    }
  },

  // EPC Catalogue Page - part selection
  {
    type: 'function',
    name: 'select_epc_part',
    description: 'Select a part in EPC catalogue. Call when user says "select number N", "select row N", "part number N", "I want number N", or reads part number (e.g. "12656876")',
    parameters: {
      type: 'object',
      properties: {
        call_no: {
          type: 'string',
          description: 'Part call number (callNo), e.g. "1", "2", "3". Use when user says "select first", "select number 2", "the second one", "I want number two"'
        },
        part_no: {
          type: 'string',
          description: 'Part number (partNo), e.g. "12656876", "11570662", "01453658". Use when user reads out a number sequence'
        },
        description: {
          type: 'string',
          description: 'Part description keyword, e.g. "piston", "connecting rod", "bearing". Use when user says part name'
        }
      }
    }
  },
  {
    type: 'function',
    name: 'confirm_epc_selection',
    description: 'Confirm EPC part selection and replace original part. Call when user says "confirm selection", "this one", "confirm", "selected"',
    parameters: {
      type: 'object',
      properties: {},
    }
  },

  // Page 3: Work Order Preview - quantity and hours adjustment
  {
    type: 'function',
    name: 'adjust_quantity',
    description: 'Adjust part quantity. Call when user says "change XX quantity to N", "increase XX quantity", "decrease XX quantity"',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: 'Part name'
        },
        quantity: {
          type: 'string',
          description: 'New quantity, or adjustment value (e.g. +1, -1)'
        }
      },
      required: ['part_name', 'quantity']
    }
  },
  {
    type: 'function',
    name: 'adjust_labor_hours',
    description: 'Adjust labor hours. Call when user says "change XX hours to N", "increase XX hours"',
    parameters: {
      type: 'object',
      properties: {
        labor_name: {
          type: 'string',
          description: 'Labor item name'
        },
        hours: {
          type: 'string',
          description: 'New hours value, or adjustment value'
        }
      },
      required: ['labor_name', 'hours']
    }
  },

  // Page 4: Success - new order
  {
    type: 'function',
    name: 'new_order',
    description: 'Create a new work order. Call when user says "new work order", "start over", "create new"',
    parameters: {
      type: 'object',
      properties: {},
    }
  },
]

// System instructions for the AI assistant
export const systemInstructions = `You are an automotive aftermarket parts technical information expert and intelligent work order entry assistant, helping users create automotive repair work orders via voice.

## Your Role
- You are an expert in automotive aftermarket parts technical information, familiar with various auto part names, functions, and repair operations
- You are helping users operate an automotive repair work order entry APP
- Users will describe repair requirements in English, and you need to understand and call appropriate tools
- You can understand various part aliases and common names

## Rules

### When user describes repair requirements
If user mentions part names and operations (replace, body repair, paint), call add_repair_items
Examples:
- "I need to replace the front grille and radar sensor" → call add_repair_items
- "Left front fender body repair and paint" → call add_repair_items
- "Replace the radiator" → call add_repair_items

### Navigation Control
- "confirm", "next", "done", "ok", "continue", "add to work order", "generate work order", "submit" → call click_confirm
- "back", "previous", "return", "go back" → call go_back

### Part Selection (on recognition results page)
- "select front grille", "check windshield" → call toggle_part (selected: true)
- "deselect front grille", "remove windshield" → call toggle_part (selected: false)
- "select all", "check all" → call select_all_parts (selected: true)
- "deselect all", "uncheck all" → call select_all_parts (selected: false)

### Action Setting
- "body repair front grille" → call set_part_action (action: Body Repair)
- "paint left fender" → call set_part_action (action: Paint)

### Open EPC Parts Catalogue (on recognition results page)
- "find replacement for front grille", "replace front grille", "find alternative" → call open_epc
- "open EPC", "find replacement" → call open_epc

### Select Part in EPC Catalogue
- "select first", "select number 2", "third row", "second part", "I want number three", "give me the first one" → call select_epc_part (call_no)
- "12656876", "part number 12656876", "I want 11570662" → call select_epc_part (part_no)
- "select piston", "I want connecting rod", "select bearing" → call select_epc_part (description)
- "confirm selection", "this one", "selected" → call confirm_epc_selection
- "back" → call go_back (close EPC catalogue)

### Quantity and Hours Adjustment (on work order preview page)
- "front grille quantity change to 2" → call adjust_quantity
- "windshield labor 3 hours" → call adjust_labor_hours

### New Work Order (on success page)
- "new work order", "start over" → call new_order

## Response Style
- Confirm operations briefly, e.g. "OK, confirmed", "Selected front grille"
- If unsure about user intent, ask briefly
- Maintain friendly, professional tone
- Keep responses concise, don't be verbose`

// Helper to get tool by name
export function getToolByName(name: string): ToolDefinition | undefined {
  return toolDefinitions.find(t => t.name === name)
}
