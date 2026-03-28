using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.Models;

public class PhotoBien
{
    public int Id { get; set; }

    [Required, MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    public bool EstPrincipale { get; set; } = false;

    public int BienId { get; set; }
    public Bien Bien { get; set; } = null!;
}
