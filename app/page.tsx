import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido de vuelta</p>
          </div>
          <Button>Nueva Acción</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="flex items-center text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +20.1%
                </span>
                vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscripciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="flex items-center text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +180.1%
                </span>
                vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="flex items-center text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +19%
                </span>
                vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos Ahora</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="flex items-center text-red-600">
                  <ArrowDownRight className="h-3 w-3" />
                  -12%
                </span>
                vs mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Juan Pérez", action: "Completó tarea", time: "Hace 2 minutos", status: "success" },
                  { name: "María García", action: "Creó nuevo proyecto", time: "Hace 15 minutos", status: "info" },
                  { name: "Carlos López", action: "Actualizó documento", time: "Hace 1 hora", status: "info" },
                  { name: "Ana Martínez", action: "Eliminó archivo", time: "Hace 2 horas", status: "warning" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{item.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.action}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === "success" ? "default" : "secondary"}>
                        {item.status === "success" ? "Completado" : "Pendiente"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Proyectos</CardTitle>
              <CardDescription>Estado de proyectos activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Dashboard Redesign", progress: 75, tasks: 12, status: "En progreso" },
                  { name: "API Migration", progress: 45, tasks: 8, status: "En progreso" },
                  { name: "Mobile App", progress: 90, tasks: 3, status: "Casi listo" },
                  { name: "Documentation", progress: 30, tasks: 15, status: "Iniciado" },
                ].map((project, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{project.name}</p>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{project.tasks} tareas</span>
                        <span className="text-muted-foreground">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Mes</CardTitle>
            <CardDescription>Métricas y estadísticas importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Tareas Completadas</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
              </div>
              <Separator orientation="vertical" className="hidden md:block" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Tiempo Promedio</p>
                <p className="text-2xl font-bold">4.2h</p>
                <p className="text-xs text-muted-foreground">-5% vs mes anterior</p>
              </div>
              <Separator orientation="vertical" className="hidden md:block" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Equipos Activos</p>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">+3 nuevos este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
