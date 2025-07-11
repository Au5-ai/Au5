using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace Au5.BackEnd.Hubs;

public class UserIdProvider : IUserIdProvider
{
	public string GetUserId(HubConnectionContext connection)
	{
		return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
	}
}
