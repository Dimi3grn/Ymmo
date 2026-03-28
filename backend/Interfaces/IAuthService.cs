using YmmoAPI.Models;

namespace YmmoAPI.Interfaces;

public interface IAuthService
{
    string GenererToken(Utilisateur utilisateur);
}
