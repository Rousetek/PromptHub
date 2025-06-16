import { useState } from "react";
import { Save, GitBranch, History, Zap, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const PromptEditor = () => {
  const [promptName, setPromptName] = useState("Customer Support Response Generator");
  const [promptContent, setPromptContent] = useState(`You are a helpful customer support agent for a SaaS company. Respond to customer inquiries with:

1. Empathy and understanding
2. Clear, actionable solutions
3. Professional but friendly tone
4. Offer additional help

Customer inquiry: {{CUSTOMER_MESSAGE}}

Company context: {{COMPANY_INFO}}

Response:`);

  const [commitMessage, setCommitMessage] = useState("");

  const aiSuggestions = [
    {
      type: "optimization",
      title: "Add input validation",
      description: "Consider adding validation for the CUSTOMER_MESSAGE variable to handle edge cases.",
      impact: "medium"
    },
    {
      type: "enhancement", 
      title: "Include examples",
      description: "Adding few-shot examples could improve response quality by 23%.",
      impact: "high"
    },
    {
      type: "structure",
      title: "Break into sections",
      description: "Consider structuring the prompt with clear sections for better AI comprehension.",
      impact: "low"
    }
  ];

  const versionHistory = [
    {
      version: "v1.3",
      commit: "Add company context variable",
      author: "promptmaster",
      date: "2 hours ago",
      changes: "+3 -1"
    },
    {
      version: "v1.2", 
      commit: "Improve tone guidelines",
      author: "promptmaster",
      date: "1 day ago",
      changes: "+5 -2"
    },
    {
      version: "v1.1",
      commit: "Initial structure and variables",
      author: "promptmaster", 
      date: "3 days ago",
      changes: "+12 -0"
    }
  ];

  const handleSave = () => {
    if (!commitMessage.trim()) {
      toast({
        title: "Commit message required",
        description: "Please provide a commit message to save your changes.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Prompt saved successfully",
      description: "Your changes have been committed to the repository.",
    });
    setCommitMessage("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptContent);
    toast({
      title: "Copied to clipboard",
      description: "Prompt content has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{promptName}</h1>
              <p className="text-gray-600 mt-1">
                <span className="text-blue-600">promptmaster</span> / customer-support-prompts / prompts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <GitBranch className="h-4 w-4 mr-2" />
                Fork
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Prompt Content</CardTitle>
                    <CardDescription>Edit your prompt and commit changes</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Template</Badge>
                    <Badge variant="secondary">Customer Support</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Prompt name"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  className="font-medium"
                />
                <Textarea
                  placeholder="Enter your prompt here..."
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  className="min-h-64 font-mono text-sm"
                />
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Commit message (describe your changes)"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Commit Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview/Test Section */}
            <Card>
              <CardHeader>
                <CardTitle>Test & Preview</CardTitle>
                <CardDescription>Test your prompt with sample inputs</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="test">Test Input</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{promptContent}</pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="test" className="mt-4">
                    <div className="space-y-4">
                      <Textarea placeholder="CUSTOMER_MESSAGE: Enter a sample customer message..." className="min-h-20" />
                      <Textarea placeholder="COMPANY_INFO: Enter company context..." className="min-h-20" />
                      <Button variant="outline">
                        <Zap className="h-4 w-4 mr-2" />
                        Test Prompt
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="variables" className="mt-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <code className="text-blue-800 font-mono">{"{{CUSTOMER_MESSAGE}}"}</code>
                        <p className="text-sm text-blue-600 mt-1">The customer's inquiry or message</p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <code className="text-blue-800 font-mono">{"{{COMPANY_INFO}}"}</code>
                        <p className="text-sm text-blue-600 mt-1">Relevant company information and context</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  AI Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{suggestion.title}</h4>
                      <Badge 
                        variant={suggestion.impact === 'high' ? 'destructive' : suggestion.impact === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {suggestion.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{suggestion.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Version History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <History className="h-4 w-4 mr-2" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {versionHistory.map((version, index) => (
                  <div key={index} className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-blue-600 font-mono">{version.version}</code>
                      <span className="text-xs text-gray-500">{version.changes}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{version.commit}</p>
                    <p className="text-xs text-gray-500">
                      {version.author} • {version.date}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
