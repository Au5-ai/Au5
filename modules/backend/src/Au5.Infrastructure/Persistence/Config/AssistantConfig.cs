using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class AssistantConfig : IEntityTypeConfiguration<Assistant>
{
	public void Configure(EntityTypeBuilder<Assistant> builder)
	{
		builder.HasKey(x => x.Id);
		builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
		builder.Property(x => x.Icon).IsUnicode(true).HasMaxLength(200);
		builder.Property(x => x.OpenAIAssistantId).HasMaxLength(100);
		builder.Property(x => x.Description).HasMaxLength(500);
		builder.Property(x => x.Instructions).HasMaxLength(2000);
		builder.Property(x => x.IsDefault).IsRequired();
		builder.Property(x => x.IsActive).IsRequired();
		builder.Property(x => x.CreatedAt).IsRequired();
		builder.Property(x => x.UserId).IsRequired();
		builder.Property(x => x.OpenAIAssistantId).IsRequired();

		builder.Property(t => t.LLMModel)
			.IsRequired()
			.HasMaxLength(50);
	}
}
