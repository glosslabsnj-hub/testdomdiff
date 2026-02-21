import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  Save,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
}

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    summary: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

const defaultResume: ResumeData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    summary: ""
  },
  experience: [],
  education: [],
  skills: []
};

const ResumeBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resume, setResume] = useState<ResumeData>(defaultResume);
  const [newSkill, setNewSkill] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  // Load saved resume from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`resume_${user.id}`);
        if (saved) {
          setResume(JSON.parse(saved));
        }
      } catch {
        localStorage.removeItem(`resume_${user.id}`);
      }
    }
  }, [user?.id]);

  const saveResume = () => {
    if (user?.id) {
      localStorage.setItem(`resume_${user.id}`, JSON.stringify(resume));
      toast({ title: "Resume Saved", description: "Your resume has been saved." });
    }
  };

  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    setResume(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      graduationYear: ""
    };
    setResume(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resume.skills.includes(newSkill.trim())) {
      setResume(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const downloadResume = () => {
    // Generate a simple text version for download
    const { personalInfo, experience, education, skills } = resume;
    let content = `${personalInfo.firstName} ${personalInfo.lastName}\n`;
    content += `${personalInfo.email} | ${personalInfo.phone}\n`;
    content += `${personalInfo.city}, ${personalInfo.state}\n\n`;
    
    content += "PROFESSIONAL SUMMARY\n";
    content += `${personalInfo.summary}\n\n`;
    
    content += "WORK EXPERIENCE\n";
    experience.forEach(exp => {
      content += `${exp.title} at ${exp.company}\n`;
      content += `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`;
      content += `${exp.description}\n\n`;
    });
    
    content += "EDUCATION\n";
    education.forEach(edu => {
      content += `${edu.degree} in ${edu.field}\n`;
      content += `${edu.institution} - ${edu.graduationYear}\n\n`;
    });
    
    content += "SKILLS\n";
    content += skills.join(", ");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${personalInfo.firstName}_${personalInfo.lastName}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Resume Downloaded", description: "Your resume has been downloaded." });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="headline-card">Resume Builder</h2>
              <p className="text-sm text-muted-foreground">Build a professional resume step by step</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button variant="goldOutline" size="sm">
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Resume Preview</DialogTitle>
                </DialogHeader>
                <div className="bg-white text-black p-8 rounded-lg">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">
                      {resume.personalInfo.firstName} {resume.personalInfo.lastName}
                    </h1>
                    <p className="text-gray-600">
                      {resume.personalInfo.email} | {resume.personalInfo.phone}
                    </p>
                    <p className="text-gray-600">
                      {resume.personalInfo.city}, {resume.personalInfo.state}
                    </p>
                  </div>
                  
                  {resume.personalInfo.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold border-b border-gray-300 mb-2">Professional Summary</h2>
                      <p className="text-gray-700">{resume.personalInfo.summary}</p>
                    </div>
                  )}
                  
                  {resume.experience.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold border-b border-gray-300 mb-2">Work Experience</h2>
                      {resume.experience.map(exp => (
                        <div key={exp.id} className="mb-4">
                          <div className="flex justify-between">
                            <strong>{exp.title}</strong>
                            <span className="text-gray-600">
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </span>
                          </div>
                          <p className="text-gray-600 italic">{exp.company}</p>
                          <p className="text-gray-700 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {resume.education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold border-b border-gray-300 mb-2">Education</h2>
                      {resume.education.map(edu => (
                        <div key={edu.id} className="mb-2">
                          <strong>{edu.degree} in {edu.field}</strong>
                          <p className="text-gray-600">{edu.institution} - {edu.graduationYear}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {resume.skills.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold border-b border-gray-300 mb-2">Skills</h2>
                      <p className="text-gray-700">{resume.skills.join(" • ")}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="gold" size="sm" onClick={saveResume}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button variant="goldOutline" size="sm" onClick={downloadResume}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </div>
      </div>

      {/* Resume Editor */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4 bg-charcoal">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Personal
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Education
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Award className="w-4 h-4" /> Skills
          </TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal" className="mt-6">
          <div className="bg-card p-6 rounded-lg border border-border space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={resume.personalInfo.firstName}
                  onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={resume.personalInfo.lastName}
                  onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={resume.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={resume.personalInfo.city}
                  onChange={(e) => updatePersonalInfo("city", e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={resume.personalInfo.state}
                  onChange={(e) => updatePersonalInfo("state", e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>
            <div>
              <Label>Professional Summary</Label>
              <Textarea
                value={resume.personalInfo.summary}
                onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                placeholder="A brief summary of your professional background and goals..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="mt-6 space-y-4">
          {resume.experience.map((exp, index) => (
            <div key={exp.id} className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Position {index + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                    placeholder="Software Developer"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    placeholder="Tech Company Inc."
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    placeholder="Jan 2020"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                    placeholder="Present"
                    disabled={exp.current}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          ))}
          <Button variant="goldOutline" onClick={addExperience} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Work Experience
          </Button>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="mt-6 space-y-4">
          {resume.education.map((edu, index) => (
            <div key={edu.id} className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Education {index + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                    placeholder="University of Example"
                  />
                </div>
                <div>
                  <Label>Graduation Year</Label>
                  <Input
                    value={edu.graduationYear}
                    onChange={(e) => updateEducation(edu.id, "graduationYear", e.target.value)}
                    placeholder="2020"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    placeholder="Bachelor's"
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="goldOutline" onClick={addEducation} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Education
          </Button>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="mt-6">
          <div className="bg-card p-6 rounded-lg border border-border space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., Customer Service, Excel, Welding)"
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
              />
              <Button variant="gold" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
            {resume.skills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Add skills that are relevant to the jobs you're applying for.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <div className="bg-charcoal p-6 rounded-lg border border-primary/30">
        <h3 className="font-semibold text-primary mb-3">💡 Resume Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Use action verbs: "Led," "Managed," "Developed," "Increased"</li>
          <li>• Quantify achievements: "Increased sales by 25%" not just "Increased sales"</li>
          <li>• Keep it to 1-2 pages maximum</li>
          <li>• Tailor your resume for each job application</li>
          <li>• Use keywords from the job description</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeBuilder;