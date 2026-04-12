
DROP TRIGGER IF EXISTS update_sales_strategy_updated_at ON public.sales_strategy;
CREATE TRIGGER update_sales_strategy_updated_at BEFORE UPDATE ON public.sales_strategy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rnd_projects_updated_at ON public.rnd_projects;
CREATE TRIGGER update_rnd_projects_updated_at BEFORE UPDATE ON public.rnd_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
