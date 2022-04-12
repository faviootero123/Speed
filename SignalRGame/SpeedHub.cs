using Microsoft.AspNetCore.SignalR;
using Scrumbs.Models;
using System.Text.Json;

namespace Scrumbs.SignalRGame;

public class SpeedHub : Hub
{
    private PlayersContext playerData;
    private static Dictionary<string, bool> IsWillingDict = new Dictionary<string, bool>();
    public SpeedHub(PlayersContext data)
    {
        playerData = data;
    }

    public async Task PlayCard(GameState obj)
    {
        Console.WriteLine(Context.ConnectionId);
        await Clients.AllExcept(Context.ConnectionId).SendAsync("MoveHandler", obj, Context.ConnectionAborted);
    }

    public async Task NewGame()
    {
        Console.WriteLine(Context.ConnectionId);

        var deck = NewDeck();
        var playerOneHand = deck.GetRange(0, 5);
        var playerTwoHand = deck.GetRange(5, 5);
        var continueL = deck.GetRange(10, 5);
        var continueR = deck.GetRange(15, 5);
        var playerOneStack = deck.GetRange(20, 15);
        var playerTwoStack = deck.GetRange(35, 15);
        var playL = deck.GetRange(50, 1).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = true });
        var playR = deck.GetRange(51, 1).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = true });

        await Clients.All.SendAsync("NewGame", new { PlayerOneHand = playerOneHand, PlayerTwoHand = playerTwoHand, ContinueL = continueL, ContinueR = continueR, PlayerOneStack = playerOneStack, PlayerTwoStack = playerTwoStack, PlayL = playL, PlayR = playR, players = playerData.players }, Context.ConnectionAborted);
    }

    public void NewUser(string UserName)
    {
        var connenctions = playerData.players.Select(p => p.ConnectionId).ToList();

        if (connenctions.Contains(Context.ConnectionId))
        {
            playerData.players[connenctions.IndexOf(Context.ConnectionId)].UserName = UserName;
        }
        else
        {
            playerData.players.Add(new User { UserName = UserName, ConnectionId = Context.ConnectionId });
        }
    }

    public async Task playAgain(string userName, bool isWilling)
    {
        IsWillingDict.TryAdd(Context.ConnectionId, isWilling);
        if(IsWillingDict.Where(p => p.Value == true).Count() > 1){
            await NewGame();
        }
    }

    public async Task Reset(Reset obj)
    {
        var stack = new List<Card>();
        stack.AddRange(obj.PlayL);
        stack.AddRange(obj.PlayR);
        stack.AddRange(obj.ContinueL);
        stack.AddRange(obj.ContinueR);

        stack = stack.OrderBy(a => Guid.NewGuid()).ToList();
        var continueL = stack.GetRange(0, 5).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = false }).ToList();
        var continueR = stack.GetRange(5, 5).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = false }).ToList();
        //var count = stack.GetRange(10, stack.Count - 10).Count;
        var count = stack.Count - 10;

        if (stack.Count % 2 == 0)
        {
            var playL = stack.GetRange(10, count / 2).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = true }).ToList();
            var playR = stack.GetRange(10 + count / 2, count / 2).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = true }).ToList();
            await Clients.All.SendAsync("ResetHandler", new Reset { ContinueL = continueL, ContinueR = continueR, PlayL = playL, PlayR = playR, IsPlayerOne = obj.IsPlayerOne });
        }
        else
        {
            var playL = stack.GetRange(10, (count + 1) / 2).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = true }).ToList();
            var playR = stack.GetRange(10 + (count + 1) / 2, count - (count + 1) / 2).Select(c => new Card { SuiteNumber = c.SuiteNumber, House = c.House, FaceUp = true }).ToList();
            await Clients.All.SendAsync("ResetHandler", new Reset { ContinueL = continueL, ContinueR = continueR, PlayL = playL, PlayR = playR, IsPlayerOne = obj.IsPlayerOne });
        }
    }

    private static List<Card> NewDeck()
    {
        var cards = new List<Card>();
        for (int i = 1; i < 5; i++)
        {
            for (int j = 1; j < 14; j++)
            {
                cards.Add(new Card { SuiteNumber = j, House = (House)i, FaceUp = false });
            }
        }
        return cards.OrderBy(a => Guid.NewGuid()).ToList();
    }
}

public class Card
{
    public int SuiteNumber { get; set; }
    public House House { get; set; }
    public bool FaceUp { get; set; }
}

public enum House
{
    Heart,
    Spade,
    Club,
    Diamond
}

public enum Suite
{
    Ace = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
}

public class Game
{
    public string Name { get; set; }
    public IList<User> Players { get; set; }
    public IList<Card> OriginalDeck { get; set; }
}

public class Reset
{
    public IList<Card> PlayR { get; set; }
    public IList<Card> PlayL { get; set; }
    public IList<Card> ContinueL { get; set; }
    public IList<Card> ContinueR { get; set; }

    public bool IsPlayerOne { get; set; }
}

public class GameState
{
    public IList<Card> Hand1 { get; set; }
    public IList<Card> Hand2 { get; set; }
    public IList<Card> PlayR { get; set; }
    public IList<Card> PlayL { get; set; }
    public IList<Card> ContinueL { get; set; }
    public IList<Card> ContinueR { get; set; }
    public IList<Card> Hand1Stack { get; set; }
    public IList<Card> Hand2Stack { get; set; }
}