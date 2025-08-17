using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class GuestsInMeetingConfig : IEntityTypeConfiguration<GuestsInMeeting>
{
	public void Configure(EntityTypeBuilder<GuestsInMeeting> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_GuestsInMeeting");

		builder.Property(m => m.FullName)
			.IsUnicode(true)
			.HasMaxLength(50);

		builder.Property(m => m.PictureUrl)
			.IsUnicode(true)
			.HasMaxLength(250);
	}
}
