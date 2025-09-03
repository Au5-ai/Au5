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

		SeedUsers(builder);
		static void SeedUsers(ModelBuilder builder)
		{
			builder.Entity<User>().HasData(
			[
			new()
				 {
					 Email = "mha.karimi@gmail.com",
					 IsActive = true,
					 FullName = "Mohammad Karimi",
					 Id = Guid.Parse("EDADA1F7-CBDA-4C13-8504-A57FE72D5960"),
					 PictureUrl = "https://i.imgur.com/ESenFCJ.jpeg",
					 Password = "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA=",
					 Role = RoleTypes.User
				 }

			]);
		}

		static void SeedReactions(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Reaction>().HasData(
				new Reaction { Id = 1, Type = "Task", Emoji = "⚡", ClassName = "reaction-task bg-blue-100 text-blue-700 border-blue-200" },
				new Reaction { Id = 2, Type = "GoodPoint", Emoji = "⭐", ClassName = "reaction-important bg-amber-100 text-amber-700 border-amber-200" },
				new Reaction { Id = 3, Type = "Bug", Emoji = "🐞", ClassName = "reaction-bug bg-rose-100 text-rose-700 border-rose-200" });
		}
	}
}
