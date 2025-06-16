import { useState } from "react";
import { ArrowLeft, Code, FileText, Globe, Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRepositories } from "@/hooks/useRepositories";
import { Repository } from "@/types/repository";

interface CreateRepositoryProps {
  onSuccess?: (repo: Repository) => void;
}

const CreateRepository = ({ onSuccess }: CreateRepositoryProps) => {
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [license, setLicense] = useState("mit");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const { createRepository } = useRepositories();

  const licenses = [
    { value: "mit", label: "MIT License" },
    { value: "apache-2.0", label: "Apache License 2.0" },
    { value: "gpl-3.0", label: "GNU General Public License v3.0" },
    { value: "bsd-3-clause", label: "BSD 3-Clause License" },
    { value: "unlicense", label: "The Unlicense" }
  ];

  const categories = [
    "Copywriting", "Development", "Marketing", "Content Creation", 
    "Data Analysis", "Automation", "Customer Support", "Sales", 
    "Education", "Research", "Creative Writing"
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 8) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoName.trim()) {
      toast({
        title: "Repository name required",
        description: "Please provide a name for your repository.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newRepo = await createRepository({
        name: repoName.trim(),
        description: description.trim(),
        tags,
        license: licenses.find(l => l.value === license)?.label || "MIT License",
        is_private: isPrivate,
        category: category || "general"
      });

      toast({
        title: "Repository created successfully!",
        description: `${repoName} has been created and is ready for prompts.`,
      });

      // Reset form
      setRepoName("");
      setDescription("");
      setIsPrivate(false);
      setLicense("mit");
      setCategory("");
      setTags([]);

      // Close dialog and pass the new repo
      onSuccess?.(newRepo);
    } catch (error) {
      console.error('Error creating repository:', error);
      toast({
        title: "Error creating repository",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Repository</h1>
        <p className="text-gray-600 mt-2">
          Set up a new repository to store and organize your AI prompts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Repository Details</CardTitle>
                <CardDescription>
                  Basic information about your prompt repository
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="repo-name">Repository Name *</Label>
                  <Input
                    id="repo-name"
                    placeholder="my-awesome-prompts"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of what this repository contains..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 min-h-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="license">License</Label>
                    <Select value={license} onValueChange={setLicense}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {licenses.map((lic) => (
                          <SelectItem key={lic.value} value={lic.value}>
                            {lic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-lg">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                      {tags.length === 0 && (
                        <span className="text-gray-400 text-sm">No tags added yet</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Add up to 8 tags to help others discover your repository
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repository Settings</CardTitle>
                <CardDescription>
                  Configure visibility and collaboration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="private-repo">Private Repository</Label>
                    <p className="text-sm text-gray-500">
                      {isPrivate 
                        ? "Only you can see this repository" 
                        : "Anyone can view and fork this repository"
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    <Switch
                      id="private-repo"
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Repository Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600">you</span>
                      <span className="text-gray-400">/</span>
                      <span className="font-medium">{repoName || "repository-name"}</span>
                      {isPrivate && <Lock className="h-3 w-3 text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-600">
                      {description || "Repository description will appear here..."}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium">Create your repository</p>
                        <p className="text-gray-600">Set up basic info and settings</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium">Add your first prompt</p>
                        <p className="text-gray-600">Upload or create prompts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium">Share with community</p>
                        <p className="text-gray-600">Let others discover and fork</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" type="button" onClick={() => onSuccess?.(undefined as any)}>
            Cancel
          </Button>
          <Button type="submit">
            <Upload className="h-4 w-4 mr-2" />
            Create Repository
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRepository;
