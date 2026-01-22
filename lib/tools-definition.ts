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
    description: '点击确认按钮，进入下一步。当用户说"确认"、"下一步"、"好了"、"确定"、"加入工单"、"生成工单"、"提交"时调用',
    parameters: {
      type: 'object',
      properties: {},
    }
  },
  {
    type: 'function',
    name: 'go_back',
    description: '返回上一页。当用户说"返回"、"上一步"、"退回"、"后退"时调用',
    parameters: {
      type: 'object',
      properties: {},
    }
  },

  // Page 1: Voice Input - repair item extraction
  {
    type: 'function',
    name: 'add_repair_items',
    description: '从用户语音中提取需要维修的配件和操作。当用户描述维修需求时调用，例如"更换前脸"、"左前翼子板钣金喷漆"、"换水箱"',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'string',
          description: '用户描述的维修需求原文，例如"更换前脸、电眼、前挡风玻璃"'
        }
      },
      required: ['items']
    }
  },

  // Page 2: Recognition Results - part selection
  {
    type: 'function',
    name: 'toggle_part',
    description: '选择或取消选择配件。当用户说"选择XX"、"取消XX"、"勾选XX"、"不要XX"时调用',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: '配件名称，如进气格栅、前挡风玻璃、引擎盖、左前大灯、左前翼子板、散热器等'
        },
        selected: {
          type: 'string',
          description: '是否选中：true表示选中，false表示取消，toggle表示切换',
          enum: ['true', 'false', 'toggle']
        }
      },
      required: ['part_name']
    }
  },
  {
    type: 'function',
    name: 'set_part_action',
    description: '设置配件的维修操作（更换、钣金、喷漆）。当用户说"XX更换"、"XX钣金"、"XX喷漆"时调用',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: '配件名称'
        },
        action: {
          type: 'string',
          description: '维修操作类型',
          enum: ['更换', '钣金', '喷漆']
        },
        enabled: {
          type: 'string',
          description: '是否启用该操作：true启用，false禁用，toggle切换',
          enum: ['true', 'false', 'toggle']
        }
      },
      required: ['part_name', 'action']
    }
  },
  {
    type: 'function',
    name: 'select_all_parts',
    description: '选择或取消所有配件。当用户说"全选"、"选择全部"、"取消全部"时调用',
    parameters: {
      type: 'object',
      properties: {
        selected: {
          type: 'string',
          description: '是否全选：true全选，false全部取消',
          enum: ['true', 'false']
        }
      },
      required: ['selected']
    }
  },
  {
    type: 'function',
    name: 'open_epc',
    description: '打开EPC配件目录查找替换件。当用户说"查找替换件"、"打开EPC"、"查找XX替换"、"替换XX"、"换个XX"、"找个XX替代"时调用',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: '要查找替换件的配件名称，如进气格栅、前挡风玻璃等'
        }
      },
      required: ['part_name']
    }
  },

  // EPC Catalogue Page - part selection
  {
    type: 'function',
    name: 'select_epc_part',
    description: '在EPC配件目录中选择配件。当用户说"选择第N个"、"选第N行"、"选择XX配件"、"我要这个"时调用',
    parameters: {
      type: 'object',
      properties: {
        call_no: {
          type: 'string',
          description: '配件的呼叫号（callNo），如"1"、"2"、"3"等。当用户说"选择第一个"、"选第2个"时使用'
        },
        description: {
          type: 'string',
          description: '配件描述关键词，如"活塞"、"连杆"、"轴承"等。当用户说配件名称时使用'
        }
      }
    }
  },
  {
    type: 'function',
    name: 'confirm_epc_selection',
    description: '确认EPC配件选择并替换原配件。当用户说"确认选择"、"就这个"、"确定"、"选好了"时调用',
    parameters: {
      type: 'object',
      properties: {},
    }
  },

  // Page 3: Work Order Preview - quantity and hours adjustment
  {
    type: 'function',
    name: 'adjust_quantity',
    description: '调整配件数量。当用户说"XX数量改为N"、"增加XX数量"、"减少XX数量"时调用',
    parameters: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: '配件名称'
        },
        quantity: {
          type: 'string',
          description: '新的数量，或者增减值（如+1、-1）'
        }
      },
      required: ['part_name', 'quantity']
    }
  },
  {
    type: 'function',
    name: 'adjust_labor_hours',
    description: '调整工时。当用户说"XX工时改为N小时"、"增加XX工时"时调用',
    parameters: {
      type: 'object',
      properties: {
        labor_name: {
          type: 'string',
          description: '工时项目名称'
        },
        hours: {
          type: 'string',
          description: '新的工时数，或者增减值'
        }
      },
      required: ['labor_name', 'hours']
    }
  },

  // Page 4: Success - new order
  {
    type: 'function',
    name: 'new_order',
    description: '创建新工单。当用户说"新建工单"、"再来一单"、"重新开始"时调用',
    parameters: {
      type: 'object',
      properties: {},
    }
  },
]

// System instructions for the AI assistant
export const systemInstructions = `你是一个汽车售后配件技术信息领域的专家，同时也是智能工单录入助手，帮助用户通过语音录入汽车维修工单。

## 你的角色
- 你是汽车售后配件技术信息领域的专家，熟悉各种汽车配件的名称、功能和维修操作
- 你正在帮助用户操作一个汽车维修工单录入APP
- 用户会用中文口语描述维修需求，你需要理解并调用相应的工具
- 你可以理解各种配件的别名和俗称，如"前脸"指进气格栅、"电眼"指雷达传感器等

## 规则

### 当用户描述维修需求时
如果用户说的内容包含配件名称和操作（更换、钣金、喷漆），调用 add_repair_items
例如：
- "我需要更换前脸、电眼" → 调用 add_repair_items
- "左前翼子板钣金喷漆" → 调用 add_repair_items
- "换个水箱" → 调用 add_repair_items

### 导航控制
- "确认"、"下一步"、"好了"、"确定"、"继续"、"加入工单"、"生成工单"、"提交" → 调用 click_confirm
- "返回"、"上一步"、"退回" → 调用 go_back

### 配件选择（在识别结果页）
- "选择进气格栅"、"勾选前挡风玻璃" → 调用 toggle_part (selected: true)
- "取消进气格栅"、"不要前挡风玻璃" → 调用 toggle_part (selected: false)
- "全选"、"选择全部" → 调用 select_all_parts (selected: true)
- "取消全部" → 调用 select_all_parts (selected: false)

### 操作设置
- "进气格栅钣金" → 调用 set_part_action (action: 钣金)
- "左前翼子板喷漆" → 调用 set_part_action (action: 喷漆)

### 打开EPC配件目录（在识别结果页）
- "查找进气格栅替换件"、"替换进气格栅"、"换个进气格栅" → 调用 open_epc
- "打开EPC"、"查找替换件" → 调用 open_epc

### EPC配件目录中选择配件
- "选择第一个"、"选第2个"、"选择第3行" → 调用 select_epc_part (call_no)
- "选择活塞"、"我要连杆"、"选轴承" → 调用 select_epc_part (description)
- "确认选择"、"就这个"、"选好了" → 调用 confirm_epc_selection
- "返回" → 调用 go_back（关闭EPC目录）

### 数量和工时调整（在工单预览页）
- "进气格栅数量改为2" → 调用 adjust_quantity
- "前挡风玻璃工时改为3小时" → 调用 adjust_labor_hours

### 新建工单（在成功页）
- "新建工单"、"再来一单" → 调用 new_order

## 回复风格
- 执行操作后用简短中文确认，如"好的，已确认"、"已选择进气格栅"
- 如果不确定用户意图，简短询问
- 保持友好、专业的语气
- 回复要简洁，不要啰嗦`

// Helper to get tool by name
export function getToolByName(name: string): ToolDefinition | undefined {
  return toolDefinitions.find(t => t.name === name)
}
