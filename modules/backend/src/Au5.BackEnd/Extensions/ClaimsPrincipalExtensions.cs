using System.Security.Claims;
using Au5.Application.Models;

namespace Au5.BackEnd.Extensions;
public static class ClaimsPrincipalExtensions
{
	public static UserDto ToUserDto(this ClaimsPrincipal principal)
	{
		var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		var fullName = principal.FindFirst(ClaimTypes.Name)?.Value;
		var pictureUrl = principal.FindFirst("pictureUrl")?.Value;

		return new UserDto
		{
			Id = Guid.TryParse(idClaim, out var guid) ? guid : Guid.Empty,
			FullName = fullName ?? string.Empty,
			PictureUrl = pictureUrl ?? string.Empty
		};
	}
}
