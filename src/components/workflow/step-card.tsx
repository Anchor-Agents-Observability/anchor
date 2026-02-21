'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Globe, RefreshCw, GitBranch, Mail, MoreVertical, Trash2, GripVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Database } from '@/lib/supabase/database.types'

type Step = Database['public']['Tables']['steps']['Row']

const stepIcons = {
  openai: Bot,
  http: Globe,
  transform: RefreshCw,
  condition: GitBranch,
  email: Mail,
}

const stepColors = {
  openai: 'text-green-600 bg-green-50 border-green-200',
  http: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  transform: 'text-violet-600 bg-violet-50 border-violet-200',
  condition: 'text-amber-600 bg-amber-50 border-amber-200',
  email: 'text-pink-600 bg-pink-50 border-pink-200',
}

interface StepCardProps {
  step: Step
  onUpdate: (stepId: string, updates: Partial<Step>) => void
  onDelete: (stepId: string) => void
}

export function StepCard({ step, onUpdate, onDelete }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [stepName, setStepName] = useState(step.name)

  const Icon = stepIcons[step.type as keyof typeof stepIcons] || Bot
  const colorClass = stepColors[step.type as keyof typeof stepColors] || stepColors.openai

  const handleNameSave = () => {
    if (stepName !== step.name) {
      onUpdate(step.id, { name: stepName })
    }
  }

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave()
    }
  }

  return (
    <Card className={cn("relative", isExpanded && "ring-2 ring-blue-200")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-md border", colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <Input
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                onBlur={handleNameSave}
                onKeyPress={handleNameKeyPress}
                className="text-sm font-medium border-none p-0 h-auto bg-transparent focus-visible:ring-0"
              />
              <div className="text-xs text-gray-500 mt-1 capitalize">
                {step.type} • Step {step.position + 1}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-move"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onDelete(step.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Step configuration will go here based on step type: {step.type}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </Button>
            </div>
          </div>
        </CardContent>
      )}

      {!isExpanded && (
        <CardContent className="pt-0 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            Configure step
          </Button>
        </CardContent>
      )}
    </Card>
  )
}