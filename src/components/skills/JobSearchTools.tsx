import { useState, useEffect } from "react";
import { 
  Target, 
  Plus, 
  Trash2, 
  ExternalLink,
  Calendar,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface JobApplication {
  id: string;
  company: string;
  position: string;
  location: string;
  status: "applied" | "interviewing" | "offered" | "rejected" | "accepted";
  appliedDate: string;
  notes: string;
  url: string;
}

const jobBoards = [
  { name: "Indeed", url: "https://indeed.com", description: "Largest job board with millions of listings" },
  { name: "LinkedIn", url: "https://linkedin.com/jobs", description: "Professional networking and job search" },
  { name: "ZipRecruiter", url: "https://ziprecruiter.com", description: "AI-powered job matching" },
  { name: "Glassdoor", url: "https://glassdoor.com", description: "Jobs plus company reviews and salaries" },
  { name: "SimplyHired", url: "https://simplyhired.com", description: "Aggregates jobs from multiple sources" },
  { name: "Snagajob", url: "https://snagajob.com", description: "Hourly and part-time positions" },
  { name: "CareerBuilder", url: "https://careerbuilder.com", description: "Established job search platform" },
  { name: "Monster", url: "https://monster.com", description: "Classic job board with career resources" },
];

const statusColors: Record<JobApplication["status"], string> = {
  applied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  interviewing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  offered: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  accepted: "bg-primary/20 text-primary border-primary/30",
};

const JobSearchTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newApp, setNewApp] = useState<Partial<JobApplication>>({
    status: "applied",
    appliedDate: new Date().toISOString().split("T")[0]
  });

  // Load saved applications
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`job_applications_${user.id}`);
      if (saved) {
        setApplications(JSON.parse(saved));
      }
    }
  }, [user?.id]);

  const saveApplications = (apps: JobApplication[]) => {
    setApplications(apps);
    if (user?.id) {
      localStorage.setItem(`job_applications_${user.id}`, JSON.stringify(apps));
    }
  };

  const addApplication = () => {
    if (!newApp.company || !newApp.position) {
      toast({ title: "Error", description: "Company and position are required", variant: "destructive" });
      return;
    }
    
    const app: JobApplication = {
      id: Date.now().toString(),
      company: newApp.company || "",
      position: newApp.position || "",
      location: newApp.location || "",
      status: newApp.status as JobApplication["status"] || "applied",
      appliedDate: newApp.appliedDate || new Date().toISOString().split("T")[0],
      notes: newApp.notes || "",
      url: newApp.url || ""
    };
    
    saveApplications([...applications, app]);
    setNewApp({ status: "applied", appliedDate: new Date().toISOString().split("T")[0] });
    setShowAddDialog(false);
    toast({ title: "Application Added", description: `Tracking ${app.company} - ${app.position}` });
  };

  const updateStatus = (id: string, status: JobApplication["status"]) => {
    const updated = applications.map(app => 
      app.id === id ? { ...app, status } : app
    );
    saveApplications(updated);
    toast({ title: "Status Updated" });
  };

  const removeApplication = (id: string) => {
    const updated = applications.filter(app => app.id !== id);
    saveApplications(updated);
    toast({ title: "Application Removed" });
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === "applied").length,
    interviewing: applications.filter(a => a.status === "interviewing").length,
    offered: applications.filter(a => a.status === "offered").length,
    accepted: applications.filter(a => a.status === "accepted").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="headline-card">Job Search Tools</h2>
              <p className="text-sm text-muted-foreground">Track applications and find opportunities</p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="w-4 h-4 mr-2" /> Add Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Job Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Company *</Label>
                  <Input
                    value={newApp.company || ""}
                    onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label>Position *</Label>
                  <Input
                    value={newApp.position || ""}
                    onChange={(e) => setNewApp({ ...newApp, position: e.target.value })}
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newApp.location || ""}
                    onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                    placeholder="City, State or Remote"
                  />
                </div>
                <div>
                  <Label>Application Date</Label>
                  <Input
                    type="date"
                    value={newApp.appliedDate || ""}
                    onChange={(e) => setNewApp({ ...newApp, appliedDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Job Posting URL</Label>
                  <Input
                    value={newApp.url || ""}
                    onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newApp.notes || ""}
                    onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                    placeholder="Any notes about this application..."
                  />
                </div>
                <Button variant="gold" onClick={addApplication} className="w-full">
                  Add Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-charcoal p-4 rounded-lg text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-lg text-center border border-blue-500/30">
          <p className="text-2xl font-bold text-blue-400">{stats.applied}</p>
          <p className="text-xs text-blue-400">Applied</p>
        </div>
        <div className="bg-yellow-500/10 p-4 rounded-lg text-center border border-yellow-500/30">
          <p className="text-2xl font-bold text-yellow-400">{stats.interviewing}</p>
          <p className="text-xs text-yellow-400">Interviewing</p>
        </div>
        <div className="bg-green-500/10 p-4 rounded-lg text-center border border-green-500/30">
          <p className="text-2xl font-bold text-green-400">{stats.offered}</p>
          <p className="text-xs text-green-400">Offered</p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg text-center border border-primary/30">
          <p className="text-2xl font-bold text-primary">{stats.accepted}</p>
          <p className="text-xs text-primary">Accepted</p>
        </div>
      </div>

      {/* Applications Table */}
      {applications.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {app.company}
                      {app.url && (
                        <a href={app.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {app.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {app.location}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateStatus(app.id, value as JobApplication["status"])}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge className={statusColors[app.status]}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="offered">Offered</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {app.appliedDate}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeApplication(app.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {applications.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No applications tracked yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Add your first application to start tracking.</p>
        </div>
      )}

      {/* Job Boards */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="font-semibold mb-4">📍 Job Search Resources</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobBoards.map((board) => (
            <a
              key={board.name}
              href={board.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-charcoal rounded-lg border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium group-hover:text-primary transition-colors">{board.name}</h4>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{board.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-charcoal p-6 rounded-lg border border-primary/30">
        <h3 className="font-semibold text-primary mb-3">💡 Job Search Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Apply to 5-10 jobs per day consistently</li>
          <li>• Follow up on applications after 1 week</li>
          <li>• Customize your resume for each job</li>
          <li>• Network on LinkedIn and attend job fairs</li>
          <li>• Practice your interview answers out loud</li>
          <li>• Research companies before applying</li>
        </ul>
      </div>
    </div>
  );
};

export default JobSearchTools;