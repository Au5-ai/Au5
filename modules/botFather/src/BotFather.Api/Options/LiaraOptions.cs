namespace BotFather.Api.Options;

public class LiaraOptions
{
    public string AuthToken { get; set; }
    public string NetworkId { get; set; }
    public string PlanId { get; set; }
    public string BundlePlanId { get; set; }
    public string BotImage { get; set; }
    public string Location { get; set; }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(AuthToken))
            throw new ArgumentException("AuthToken is required", nameof(AuthToken));

        if (string.IsNullOrWhiteSpace(NetworkId))
            throw new ArgumentException("NetworkId is required", nameof(NetworkId));

        if (string.IsNullOrWhiteSpace(PlanId))
            throw new ArgumentException("PlanId is required", nameof(PlanId));

        if (string.IsNullOrWhiteSpace(BundlePlanId))
            throw new ArgumentException("BundlePlanId is required", nameof(BundlePlanId));

        if (string.IsNullOrWhiteSpace(BotImage))
            throw new ArgumentException("BotImage is required", nameof(BotImage));
        
        if (string.IsNullOrWhiteSpace(Location))
            throw new ArgumentException("Location is required", nameof(Location));
    }
}
