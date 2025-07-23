using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class AppliedReactionsConfig : IEntityTypeConfiguration<AppliedReactions>
{
	public void Configure(EntityTypeBuilder<AppliedReactions> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_AppliedReactions");

		builder.OwnsMany(t => t.Participants, participants =>
		{
			participants.ToJson();
		});
	}
}
