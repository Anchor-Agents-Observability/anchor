'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Bot, Globe, RefreshCw, GitBranch, Mail } from 'lucide-react'

const nodeTypes = [
  {
    type: 'openai',
    name: 'OpenAI Chat',
    description: 'AI text generation',
    icon: Bot,
    color: 'text-green-600'
  },
  {
    type: 'http',
    name: 'HTTP Request',
    description: 'Call any API',
    icon: Globe,
    color: 'text-indigo-600'
  },
  {
    type: 'transform',
    name: 'Transform',
    description: 'Reshape data',
    icon: RefreshCw,
    color: 'text-violet-600'
  },
  {
    type: 'condition',
    name: 'Condition',
    description: 'If/else logic',
    icon: GitBranch,
    color: 'text-amber-600'
  },
  {
    type: 'email',
    name: 'Email',
    description: 'Send an email',
    icon: Mail,
    color: 'text-pink-600'
  }
]

interface AddStepButtonProps {
  onAddStep: (type: string) => void
}

export function AddStepButton({ onAddStep }: AddStepButtonProps) {
  return (
    <div className="flex justify-center py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add step
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon
            return (
              <DropdownMenuItem
                key={nodeType.type}
                onClick={() => onAddStep(nodeType.type)}
                className="p-3"
              >
                <Icon className={`w-5 h-5 mr-3 ${nodeType.color}`} />
                <div>
                  <div className="font-medium">{nodeType.name}</div>
                  <div className="text-sm text-gray-500">{nodeType.description}</div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}