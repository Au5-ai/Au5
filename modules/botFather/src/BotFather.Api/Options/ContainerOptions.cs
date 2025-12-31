namespace BotFather.Api.Options;

public class ContainerOptions
{
    public string BotImage { get; set; }
    public string Type { get; set; }
    public SelfHostOptions SelfHost { get; set; }
    public LiaraOptions Liara { get; set; }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(BotImage))
            throw new ArgumentException("BotImage is required", nameof(BotImage));

        if (string.IsNullOrWhiteSpace(Type))
            throw new ArgumentException("Type is required", nameof(Type));

        if (Type.Equals("Liara", StringComparison.OrdinalIgnoreCase))
        {
            if (Liara == null)
                throw new ArgumentException("Liara options are required when Type is 'Liara'", nameof(Liara));
            
            Liara.BotImage = BotImage;
            Liara.Validate();
        }
        else if (Type.Equals("SelfHost", StringComparison.OrdinalIgnoreCase))
        {
            if (SelfHost == null)
                throw new ArgumentException("SelfHost options are required when Type is 'SelfHost'", nameof(SelfHost));
            
            SelfHost.Validate();
        }
        else
        {
            throw new ArgumentException($"Invalid Type '{Type}'. Must be either 'Liara' or 'SelfHost'", nameof(Type));
        }
    }
}
