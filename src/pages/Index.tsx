import { useState } from "react";
import { Search, Plus, GitFork, Star, Code, Users, BookOpen, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRepositories } from "@/hooks/useRepositories";
import { useAuth } from "@/contexts/AuthContext";
import CreateRepository from "@/components/CreateRepository";
import UserProfile from "@/components/UserProfile";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { repositoryStore } from "@/stores/repositoryStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { repositories, stats } = useRepositories();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const trendingTags = [
    "copywriting", "development", "marketing", "content", "sales", "nlp", 
    "automation", "analysis", "creative-writing", "research", "education"
  ];

  const handleCreateRepository = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a repository.",
        variant: "destructive"
      });
      setShowAuthModal(true);
      return;
    }
    setShowCreateDialog(true);
  };

  const handleStarRepository = async (repositoryId: string, isStarred: boolean) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to star repositories.",
        variant: "destructive"
      });
      setShowAuthModal(true);
      return;
    }

    try {
      if (isStarred) {
        await repositoryStore.unstarRepository(repositoryId);
        toast({
          title: "Repository unstarred",
          description: "Removed from your starred repositories.",
        });
      } else {
        await repositoryStore.starRepository(repositoryId);
        toast({
          title: "Repository starred",
          description: "Added to your starred repositories.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update star status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setSearchQuery(tag);
  };

  const handleBrowseRepositories = () => {
    const trendingSection = document.getElementById('trending-section');
    if (trendingSection) {
      trendingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleForkClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to fork repositories.",
        variant: "destructive"
      });
      setShowAuthModal(true);
      return;
    }
    // TODO: Implement fork functionality
    toast({
      title: "Coming soon",
      description: "Fork functionality will be available soon.",
    });
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <img src="/logo.png" alt="PromptHub Logo" className="h-12 w-12" />
                <span className="text-xl font-bold text-gray-900">PromptHub</span>
                <Badge variant="secondary" className="text-xs">Open Source</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleForkClick}>
                <GitFork className="h-4 w-4 mr-2" />
                Fork
              </Button>
              {user ? (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Repository
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <CreateRepository 
                      onSuccess={(repo) => {
                        setShowCreateDialog(false);
                        if (repo) {
                          navigate(`/repository/${repo.owner_username}/${repo.name}`);
                        }
                      }} 
                    />
                  </DialogContent>
                </Dialog>
              ) : (
                <Button size="sm" onClick={handleCreateRepository} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Repository
                </Button>
              )}
              <UserProfile onSignInClick={() => setShowAuthModal(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="/logo.png" alt="PromptHub Logo" className="h-96 w-96 mx-auto mb-8" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Open Source AI Prompt Repository
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Clone, fork, share, and collaborate on AI prompts. The community platform for prompt engineering and version control.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="secondary" onClick={handleBrowseRepositories}>
              <Code className="h-5 w-5 mr-2" />
              Browse Repositories
            </Button>
            {user ? (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white bg-transparent hover:bg-white hover:text-blue-600"
                onClick={handleCreateRepository}
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Contributing
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white bg-transparent hover:bg-white hover:text-blue-600"
                onClick={() => setShowAuthModal(true)}
              >
                <Zap className="h-5 w-5 mr-2" />
                Sign In to Contribute
              </Button>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-12 text-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalRepos}</div>
              <div className="text-sm">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalPrompts}</div>
              <div className="text-sm">Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalContributors}</div>
              <div className="text-sm">Contributors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="trending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Trending Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant={selectedTag === tag ? "default" : "outline"} 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={handleCreateRepository}
                    disabled={!user}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Repository
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Join Community
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Repository Grid */}
            <div id="trending-section" className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRepositories.map((repo) => (
                  <Card key={repo.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={repo.owner_avatar} />
                            <AvatarFallback>{repo.owner_username[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{repo.owner_username}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStarRepository(repo.id, repo.is_starred)}
                        >
                          <Star className={`h-4 w-4 ${repo.is_starred ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">
                        <span 
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={() => navigate(`/repository/${repo.owner_username}/${repo.name}`)}
                        >
                          {repo.name}
                        </span>
                      </CardTitle>
                      <CardDescription>{repo.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {repo.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="h-4 w-4" />
                          <span>{repo.forks}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{repo.contributors}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default Index;
