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
		SeedReactions(builder);
		SeedMenus(builder);

		static void SeedReactions(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Reaction>().HasData(
				new Reaction { Id = 1, Type = "Task", Emoji = "⚡", ClassName = "reaction-task bg-blue-100 text-blue-700 border-blue-200" },
				new Reaction { Id = 2, Type = "GoodPoint", Emoji = "⭐", ClassName = "reaction-important bg-amber-100 text-amber-700 border-amber-200" },
				new Reaction { Id = 3, Type = "Bug", Emoji = "🐞", ClassName = "reaction-bug bg-rose-100 text-rose-700 border-rose-200" });
		}

		static void SeedMenus(ModelBuilder modelBuilder)
		{
			var menus = new[]
			{
				new Menu { Id = 100, Title = "My Meetings", Url = "/meetings/my", Icon = "ClosedCaption", SortOrder = 1, IsActive = true },
				new Menu { Id = 200, Title = "Archived Transcripts", Url = "/meetings/archived", Icon = "ArchiveIcon", SortOrder = 2, IsActive = true },
				new Menu { Id = 300, Title = "AI Tools", Url = "/assistants", Icon = "Brain", SortOrder = 3, IsActive = true },
				new Menu { Id = 400, Title = "System Settings", Url = "/system", Icon = "Settings", SortOrder = 4, IsActive = true },
				new Menu { Id = 500, Title = "User Management", Url = "/users", Icon = "UserPlus", SortOrder = 5, IsActive = true }
			};

			var roleMenus = new[]
			{
				new RoleMenu { MenuId = 100, RoleType = RoleTypes.User },
				new RoleMenu { MenuId = 200, RoleType = RoleTypes.User },
				new RoleMenu { MenuId = 300, RoleType = RoleTypes.User },
				new RoleMenu { MenuId = 300, RoleType = RoleTypes.Admin },
				new RoleMenu { MenuId = 400, RoleType = RoleTypes.Admin },
				new RoleMenu { MenuId = 500, RoleType = RoleTypes.Admin }
			};

			modelBuilder.Entity<Menu>().HasData(menus);
			modelBuilder.Entity<RoleMenu>().HasData(roleMenus);
		}
	}
}
