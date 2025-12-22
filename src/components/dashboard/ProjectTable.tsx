import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectFormModal, Project, ProjectFormData } from "@/components/projects/ProjectFormModal";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { FolderKanban } from "lucide-react";

const initialProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "E-Ticaret Platformu",
    description: "Modern e-ticaret çözümü",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
  },
  {
    id: "PRJ-002",
    name: "Mobil Uygulama",
    description: "iOS ve Android mobil uygulama geliştirme",
    status: "active",
    startDate: "2024-03-01",
  },
  {
    id: "PRJ-003",
    name: "Web Portal",
    description: "Kurumsal web portal projesi",
    status: "inactive",
    startDate: "2023-06-01",
    endDate: "2024-01-31",
  },
  {
    id: "PRJ-004",
    name: "API Entegrasyonu",
    description: "Üçüncü parti API entegrasyonları",
    status: "archived",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  },
];

const statusConfig = {
  active: { label: "Aktif", variant: "success" as const },
  inactive: { label: "Pasif", variant: "secondary" as const },
  archived: { label: "Arşivlendi", variant: "outline" as const },
};

interface ProjectTableProps {
  onAddClick?: () => void;
  showAddButton?: boolean;
}

export function ProjectTable({ onAddClick, showAddButton = false }: ProjectTableProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      toast({
        title: "Proje Silindi",
        description: `${selectedProject.name} projesi başarıyla silindi.`,
      });
      setSelectedProject(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateProject = (data: ProjectFormData) => {
    if (selectedProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? {
                ...p,
                name: data.name,
                description: data.description,
                status: data.status,
                startDate: data.startDate.toISOString().split("T")[0],
                endDate: data.endDate?.toISOString().split("T")[0],
              }
            : p
        )
      );
      setSelectedProject(null);
    }
  };

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban className="h-12 w-12" />}
        title="Proje bulunamadı"
        description="Henüz hiç proje oluşturulmamış. Yeni bir proje oluşturmak için yukarıdaki butona tıklayın."
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{project.name}</p>
                <p className="text-xs text-muted-foreground truncate">{project.id}</p>
              </div>
              <Badge variant={statusConfig[project.status].variant} className="text-xs">
                {statusConfig[project.status].label}
              </Badge>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Başlangıç</p>
                <p className="font-medium text-foreground">
                  {new Date(project.startDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bitiş</p>
                <p className="font-medium text-foreground">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString("tr-TR") : "-"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(project)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(project)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proje ID
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proje Adı
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Açıklama
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Durum
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Başlangıç Tarihi
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bitiş Tarihi
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{project.id}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <p className="font-medium text-sm text-foreground">{project.name}</p>
                  </td>
                  <td className="px-4 xl:px-6 py-3">
                    <p className="text-xs lg:text-sm text-muted-foreground max-w-xs truncate">
                      {project.description || "-"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3">
                    <Badge variant={statusConfig[project.status].variant} className="text-xs">
                      {statusConfig[project.status].label}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    {new Date(project.startDate).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-sm text-foreground">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString("tr-TR") : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 xl:px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(project)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <ProjectFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        project={selectedProject}
        onSubmit={handleUpdateProject}
      />

      {/* Delete Dialog */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={selectedProject?.name || ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

