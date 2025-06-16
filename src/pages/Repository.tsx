import { useState, useEffect } from "react";
import { ArrowLeft, Star, GitFork, Eye, Download, Code, FileText, Clock, Users, Copy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { promptService } from "@/services/promptService";
import { Prompt } from "@/types/prompt";
import CreatePromptDialog from "@/components/CreatePromptDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Repository = () => {
  const { owner, name } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isStarred, setIsStarred] = useState(false);
  const [isFork, setIsFork] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [repositoryData, setRepositoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!owner || !name) {
      toast({
        title: "Invalid URL",
        description: "Repository owner and name are required.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    loadRepositoryData();
  }, [owner, name]);

  useEffect(() => {
    if (repositoryData?.id) {
      loadPrompts();
    }
  }, [repositoryData]);

  const loadRepositoryData = async () => {
    try {
      setLoading(true);
      console.log('Loading repository data for:', { owner, name });
      
      // First get the owner's profile
      const { data: ownerProfiles, error: ownerError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .eq('username', owner);

      if (ownerError) {
        console.error('Error loading owner profile:', ownerError);
        throw new Error(`Failed to load owner profile: ${ownerError.message}`);
      }

      if (!ownerProfiles || ownerProfiles.length === 0) {
        console.error('No profile found for username:', owner);
        throw new Error(`User '${owner}' not found`);
      }

      if (ownerProfiles.length > 1) {
        console.error('Multiple profiles found with username:', owner);
        throw new Error(`Multiple users found with username '${owner}'. Please contact support.`);
      }

      const ownerProfile = ownerProfiles[0];
      console.log('Found owner profile:', ownerProfile);

      // Get the repository data
      const { data: repos, error: repoError } = await supabase
        .from('repositories')
        .select('*')
        .eq('name', name)
        .eq('owner_id', ownerProfile.id);

      if (repoError) {
        console.error('Error loading repository:', repoError);
        console.error('Error details:', {
          code: repoError.code,
          message: repoError.message,
          details: repoError.details,
          hint: repoError.hint
        });
        throw new Error(`Failed to load repository: ${repoError.message}${repoError.hint ? ` (${repoError.hint})` : ''}`);
      }

      if (!repos || repos.length === 0) {
        console.error('No repository found:', { name, owner_id: ownerProfile.id });
        throw new Error(`Repository '${name}' not found for user '${owner}'`);
      }

      if (repos.length > 1) {
        console.error('Multiple repositories found:', { name, owner_id: ownerProfile.id, count: repos.length });
        throw new Error(`Multiple repositories found with name '${name}'. Please contact support.`);
      }

      const repo = repos[0];
      console.log('Found repository:', repo);

      // Check if the current user has starred this repository
      if (user) {
        const { data: star, error: starError } = await supabase
          .from('stars')
          .select('id')
          .eq('repository_id', repo.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (starError) {
          console.error('Error checking star status:', starError);
        }

        setIsStarred(!!star);
      }

      setRepositoryData({
        ...repo,
        author: ownerProfile.username,
        author_email: ownerProfile.email || ''
      });
    } catch (error) {
      console.error('Error loading repository:', error);
      toast({
        title: "Error loading repository",
        description: error instanceof Error ? error.message : "Failed to load repository. Please try again.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const repoPrompts = await promptService.getRepositoryPrompts(repositoryData.id);
      setPrompts(repoPrompts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      toast({
        title: "Error",
        description: "Failed to load prompts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePromptClick = async (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleStarRepository = async (repositoryId: string, isStarred: boolean) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to star repositories.",
        variant: "destructive"
      });
      return;
    }
    setIsStarred(!isStarred);
    toast({
      title: isStarred ? "Repository unstarred" : "Repository starred",
      description: isStarred ? "Removed from your starred repositories." : "Added to your starred repositories.",
    });
  };

  const handleForkClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to fork repositories.",
        variant: "destructive"
      });
      return;
    }
    setIsFork(!isFork);
    toast({
      title: "Coming soon",
      description: "Fork functionality will be available soon.",
    });
  };

  const handleDownloadClick = () => {
    // TODO: Implement download functionality
    toast({
      title: "Coming soon",
      description: "Download functionality will be available soon.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const contributors = [
    { name: "promptmaster", avatar: "/api/placeholder/32/32", commits: 47 },
    { name: "copywriter", avatar: "/api/placeholder/32/32", commits: 12 },
    { name: "marketingguru", avatar: "/api/placeholder/32/32", commits: 8 }
  ];

  const recentCommits = [
    {
      message: "Add mobile-first email templates",
      author: "promptmaster", 
      time: "2 hours ago",
      hash: "abc123f"
    },
    {
      message: "Update onboarding sequence prompts",
      author: "copywriter",
      time: "1 day ago", 
      hash: "def456a"
    },
    {
      message: "Fix typos in landing page templates",
      author: "promptmaster",
      time: "3 days ago",
      hash: "ghi789b"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading repository...</p>
        </div>
      </div>
    );
  }

  if (!repositoryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Repository not found</p>
          <Button onClick={handleBackClick} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Watch
              </Button>
              <Button 
                variant={isStarred ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStarRepository(repositoryData.id, isStarred)}
              >
                <Star className="h-4 w-4 mr-2" />
                {isStarred ? "Starred" : "Star"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleForkClick}>
                <GitFork className="h-4 w-4 mr-2" />
                Fork
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="code" className="space-y-6">
              <TabsList>
                <TabsTrigger value="code">
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="commits">Commits</TabsTrigger>
                <TabsTrigger value="readme">README</TabsTrigger>
              </TabsList>

              <TabsContent value="code">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Repository Files</CardTitle>
                      {user && repositoryData.owner_id === user.id && (
                        <CreatePromptDialog 
                          repositoryId={repositoryData.id} 
                          onPromptCreated={loadPrompts}
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedPrompt ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">{selectedPrompt.name}</h2>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              navigator.clipboard.writeText(selectedPrompt.content);
                              toast({
                                title: "Copied to clipboard",
                                description: "Prompt content has been copied to your clipboard.",
                              });
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPrompt(null)}>
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back
                            </Button>
                          </div>
                        </div>
                        {selectedPrompt.description && (
                          <p className="text-gray-600">{selectedPrompt.description}</p>
                        )}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{selectedPrompt.content}</pre>
                        </div>
                      </div>
                    ) : prompts.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No prompts yet</p>
                        {user && repositoryData?.owner_id === user.id && (
                          <p className="text-sm text-gray-400 mt-2">
                            Click "New File" to add your first prompt
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prompts.map((prompt) => (
                          <Card 
                            key={prompt.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium">{prompt.name}</h3>
                                  {prompt.description && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      {prompt.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {new Date(prompt.updated_at).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {(prompt.content.length / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="commits">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Commits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCommits.map((commit) => (
                        <div key={commit.hash} className="flex items-start space-x-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/api/placeholder/32/32?seed=${commit.author}`} />
                            <AvatarFallback>{commit.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{commit.message}</p>
                              <span className="text-sm text-gray-500">{commit.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{commit.author}</span>
                              <span>•</span>
                              <code className="bg-gray-100 px-1 rounded">{commit.hash}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="readme">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">README</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <h1 className="text-3xl font-bold mb-4">{repositoryData.name}</h1>
                      <p className="text-lg text-gray-600 mb-6">{repositoryData.description}</p>
                      
                      <h2 className="text-2xl font-semibold mb-4">Contents</h2>
                      <ul className="list-disc pl-6 mb-6">
                        {prompts.map((prompt) => (
                          <li key={prompt.id} className="mb-2">
                            <span className="font-medium">{prompt.name}</span>
                            {prompt.description && (
                              <span className="text-gray-600"> - {prompt.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>

                      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                      <ol className="list-decimal pl-6 mb-6">
                        <li className="mb-2">Browse through the available prompts in the Code tab</li>
                        <li className="mb-2">Click on any prompt to view its full content</li>
                        <li className="mb-2">Use the Copy button to copy the prompt to your clipboard</li>
                        <li className="mb-2">Paste the prompt into your preferred AI model</li>
                        <li className="mb-2">Press Create file to save your prompt</li>
                      </ol>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Repository Information</h3>
                        <dl className="grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-gray-600">Created</dt>
                            <dd>{new Date(repositoryData.created_at).toLocaleDateString()}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-600">Owner</dt>
                            <dd>{repositoryData.author}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-600">Total Prompts</dt>
                            <dd>{prompts.length}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contributors.map((contributor) => (
                    <div key={contributor.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contributor.avatar} />
                          <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                        </Avatar>
                        <span 
                          className="text-sm font-medium hover:underline cursor-pointer"
                          onClick={() => navigate(`/user/${contributor.name}`)}
                        >
                          {contributor.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{contributor.commits} commits</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Repository Info</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Language</dt>
                    <dd className="font-medium">{repositoryData.language}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Size</dt>
                    <dd className="font-medium">{repositoryData.size}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="font-medium">{repositoryData.created}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">License</dt>
                    <dd className="font-medium">{repositoryData.license}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Repository;
