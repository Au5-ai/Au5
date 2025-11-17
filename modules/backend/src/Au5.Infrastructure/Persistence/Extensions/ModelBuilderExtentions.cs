using System.Reflection;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Au5.Infrastructure.Persistence.Extensions;

/// <summary>
/// This extension is programmed for registering Entities that are defined the EntityAttribute .
/// </summary>
public static class ModelBuilderExtension
{
	public static void RegisterEntities(this ModelBuilder modelBuilder, params Assembly[] assemblies)
	{
		var types = assemblies.SelectMany(x => x.GetExportedTypes())
			.Where(x => x.IsClass
						&& !x.IsAbstract
						&& x.IsPublic
						&& Attribute.IsDefined(x, typeof(EntityAttribute)));

		foreach (var type in types)
		{
			modelBuilder.Entity(type);
		}
	}

	public static void SeedData(this ModelBuilder builder)
	{
		SeedMenus(builder);

		static void SeedMenus(ModelBuilder modelBuilder)
		{
			var menus = new[]
			{
				new Menu { Id = 100, Title = "My Meetings", Url = "/meetings/my", Icon = "ClosedCaption", SortOrder = 1, IsActive = true },
				new Menu { Id = 200, Title = "Archived Transcripts", Url = "/meetings/archived", Icon = "ArchiveIcon", SortOrder = 2, IsActive = true },
				new Menu { Id = 300, Title = "AI Tools", Url = "/assistants", Icon = "Brain", SortOrder = 3, IsActive = true },
				new Menu { Id = 400, Title = "Settings", Url = "/settings", Icon = "Settings", SortOrder = 4, IsActive = true },
				new Menu { Id = 500, Title = "User Management", Url = "/users", Icon = "UserPlus", SortOrder = 5, IsActive = true },
				new Menu { Id = 600, Title = "Spaces", Url = "/spaces", Icon = "Frame", SortOrder = 6, IsActive = true }
			};

			var roleMenus = new[]
			{
				new RoleMenu { MenuId = 100, RoleType = RoleTypes.User },
				new RoleMenu { MenuId = 200, RoleType = RoleTypes.User },
				new RoleMenu { MenuId = 300, RoleType = RoleTypes.User },

				new RoleMenu { MenuId = 100, RoleType = RoleTypes.Admin },
				new RoleMenu { MenuId = 200, RoleType = RoleTypes.Admin },
				new RoleMenu { MenuId = 300, RoleType = RoleTypes.Admin },
				new RoleMenu { MenuId = 400, RoleType = RoleTypes.Admin },
				new RoleMenu { MenuId = 500, RoleType = RoleTypes.Admin },
				new RoleMenu { MenuId = 600, RoleType = RoleTypes.Admin }
			};

			modelBuilder.Entity<Menu>().HasData(menus);
			modelBuilder.Entity<RoleMenu>().HasData(roleMenus);
		}
	}
}
