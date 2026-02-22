
import { useState, useCallback } from 'react';
import { FileNode, AgentAction, ChatSession, ChatMessage } from '../types';
import { chatWithAI } from '../services/geminiService';

interface UseAIAssistantProps {
  files: FileNode[];
  activeSession: ChatSession | null;
  onUpdateSession: (session: ChatSession) => void;
  onAgentAction: (actions: AgentAction[]) => Promise<void>;
  addLog: (type: any, msg: string) => void;
}

export const useAutonomousAgent = ({ files, activeSession, onUpdateSession, onAgentAction, addLog }: UseAIAssistantProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (text: string, attachments: { mimeType: string, data: string }[] = []) => {
    if (isProcessing || !activeSession) return;
    setIsProcessing(true);

    // Add user message immediately
    const userMsg: ChatMessage = { 
      id: `u_${Date.now()}`, 
      role: 'user', 
      text: text, 
      timestamp: Date.now(),
      // Store metadata about attachments in the message if needed for UI, 
      // though we aren't persisting the full base64 in history to keep localStorage light.
      attachments: attachments.map(a => ({
          type: a.mimeType.startsWith('image/') ? 'image' : 'file',
          url: '', // No URL for base64
          name: 'Attachment' 
      }))
    };
    
    const updatedSessionWithUser = { ...activeSession, messages: [...activeSession.messages, userMsg] };
    onUpdateSession(updatedSessionWithUser);

    try {
        const response = await chatWithAI(text, files, updatedSessionWithUser.messages, attachments);

        // Convert file operations to AgentActions
        const actions: AgentAction[] = response.files.map(f => ({
            action: f.operation,
            path: f.path,
            content: f.code
        }));

        if (response.commands) {
            response.commands.forEach(cmd => actions.push({ action: 'terminal_command', command: cmd }));
        }

        // Execute actions immediately
        if (actions.length > 0) {
            await onAgentAction(actions);
        }

        // Add Bot Message
        const botMsg: ChatMessage = {
            id: `b_${Date.now()}`,
            role: 'model',
            text: response.message,
            timestamp: Date.now(),
            groundingLinks: response.groundingLinks
        };

        onUpdateSession({
            ...updatedSessionWithUser,
            messages: [...updatedSessionWithUser.messages, botMsg],
            lastUpdated: Date.now()
        });

    } catch (error) {
        addLog('error', 'AI Processing Failed');
        const errorMsg: ChatMessage = {
            id: `err_${Date.now()}`,
            role: 'model',
            text: "I couldn't process that request. Connection interrupted.",
            timestamp: Date.now()
        };
        onUpdateSession({ ...updatedSessionWithUser, messages: [...updatedSessionWithUser.messages, errorMsg] });
    } finally {
        setIsProcessing(false);
    }
  }, [activeSession, files, isProcessing, onUpdateSession, onAgentAction, addLog]);

  return { isProcessing, sendMessage };
};
