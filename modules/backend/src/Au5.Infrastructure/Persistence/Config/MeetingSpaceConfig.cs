using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class MeetingSpaceConfig : IEntityTypeConfiguration<MeetingSpace>
{
	public void Configure(EntityTypeBuilder<MeetingSpace> builder)
	{
		builder.HasKey(us => new { us.MeetingId, us.SpaceId })
			.HasName("PK_dbo_MeetingSpace");

		builder.Property(x => x.CreatedAt)
			.IsRequired();

		builder.HasOne(us => us.Meeting)
			.WithMany(u => u.MeetingSpaces)
			.HasForeignKey(us => us.MeetingId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.HasOne(us => us.User)
			.WithMany(u => u.MeetingSpaces)
			.HasForeignKey(us => us.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.HasOne(us => us.Space)
			.WithMany(s => s.MeetingSpaces)
			.HasForeignKey(us => us.SpaceId)
			.OnDelete(DeleteBehavior.Restrict);
	}
}
