using System.Security.Claims;
using Au5.Domain.Common;

namespace Au5.BackEnd.Extensions;

public static class ClaimsPrincipalExtensions
{
	public static Participant ToParticipant(this ClaimsPrincipal principal)
	{
		ArgumentNullException.ThrowIfNull(principal);

		return new Participant
		{
			Id = Guid.TryParse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty,
			FullName = principal.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
			PictureUrl = principal.FindFirstValue("pictureUrl") ?? string.Empty
		};
	}
}
