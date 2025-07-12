using System.Linq;
using System.Reflection.Emit;
using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class MeetingConfig : IEntityTypeConfiguration<Meeting>
{
	public void Configure(EntityTypeBuilder<Meeting> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_Meeting");

		builder.OwnsMany(m => m.Participants, participantsBuilder =>
		{
			participantsBuilder.ToJson();
		});

		builder.OwnsMany(m => m.Entries, participantsBuilder =>
		{
			participantsBuilder.ToJson();
		});
	}
}
