using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class ParticipantInMeetingConfig : IEntityTypeConfiguration<ParticipantInMeeting>
{
	public void Configure(EntityTypeBuilder<ParticipantInMeeting> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_ParticipantInMeeting");

		builder.Property(x => x.IsArchived)
			.IsRequired()
			.HasDefaultValue(false);

		builder.Property(x => x.IsFavorite)
			.IsRequired()
			.HasDefaultValue(false);
	}
}
