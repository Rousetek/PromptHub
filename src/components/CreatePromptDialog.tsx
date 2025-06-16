import { useState } from "react";
import { FileText, Plus, Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { promptService } from "@/services/promptService";
import { useOpenRouter } from "@/hooks/useOpenRouter";

interface CreatePromptDialogProps {
  repositoryId: string;
  onPromptCreated?: () => void;
}

const CreatePromptDialog = ({ repositoryId, onPromptCreated }: CreatePromptDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { sendMessage, isLoading: isGenerating, error: generationError, response } = useOpenRouter({
    model: "anthropic/claude-3-opus-20240229",
    temperature: 0.7,
  });

  const handleGenerateResponse = async () => {
    if (!content.trim()) {
      toast({
        title: "Prompt content required",
        description: "Please provide prompt content before generating a response.",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendMessage(content);
    } catch (error) {
      toast({
        title: "Error generating response",
        description: error instanceof Error ? error.message : "Failed to generate response",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide both a name and content for the prompt.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fileName = name.endsWith('.md') ? name : `${name}.md`;
      // Use AI response if available, otherwise use user input
      const promptToSave = response?.choices?.[0]?.message?.content?.trim() || content.trim();
      
      await promptService.createPrompt(repositoryId, {
        name: fileName,
        content: promptToSave,
        description: description.trim(),
        file_path: fileName
      });

      toast({
        title: "Prompt created successfully!",
        description: `${fileName} has been added to the repository.`,
      });

      // Reset form
      setName("");
      setDescription("");
      setContent("");
      setOpen(false);
      
      onPromptCreated?.();
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast({
        title: "Error creating prompt",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Prompt File</DialogTitle>
          <DialogDescription>
            Add a new prompt file to this repository
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto space-y-4 min-h-0">
          <div>
            <Label htmlFor="prompt-name">File Name</Label>
            <Input
              id="prompt-name"
              placeholder="e.g., customer-support-responder.md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="prompt-content">Prompt Content</Label>
            <Textarea
              id="prompt-content"
              placeholder="This is where you write the main body of your prompt..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 min-h-48 font-mono text-sm"
            />
            <div className="mt-2 flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleGenerateResponse}
                disabled={isGenerating || !content.trim()}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Response"}
              </Button>
            </div>
          </div>

          {response && (
            <div>
              <Label htmlFor="ai-response">AI Response</Label>
              <div className="mt-1 bg-gray-50 rounded-lg p-4 flex items-start">
                <pre className="whitespace-pre-wrap font-mono text-sm flex-1" id="ai-response-content">
                  {response.choices?.[0]?.message?.content || ""}
                </pre>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={async () => {
                    const text = response.choices?.[0]?.message?.content || "";
                    if (text) {
                      try {
                        await navigator.clipboard.writeText(text);
                        toast({
                          title: "Copied to clipboard",
                          description: "AI response has been copied to your clipboard.",
                        });
                      } catch (err) {
                        toast({
                          title: "Copy failed",
                          description: "Could not copy to clipboard. Please copy manually.",
                          variant: "destructive"
                        });
                      }
                    } else {
                      toast({
                        title: "Nothing to copy",
                        description: "There is no AI response to copy.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}

          {generationError && (
            <div className="text-red-500 text-sm">
              Error: {generationError.message}
            </div>
          )}

          <div>
            <Label htmlFor="prompt-description">Description (optional)</Label>
            <Input
              id="prompt-description"
              placeholder="A brief summary of what this prompt does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-2 flex justify-end space-x-3 border-t z-10">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <FileText className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create File"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromptDialog;
