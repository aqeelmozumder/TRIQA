using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using TripleQA.Models;

namespace TripleQA.Controllers
{



    public class HomeController : Controller
    {

        public static class GameData
        {

           // List<int> termsList = new List<int>();
            public static List<String> Active_games = new List<String>();
            public static String Host;
            public static bool GameStarted;
            public static bool Round1AnswersDone;
            public static bool Round1ScoresDone;
            public static int VotesDone;
            public static int R3Count;
            public static List<String> PlayerList = new List<String>();
            public static Dictionary<String,String> round1Answers = new Dictionary<String,String>();
            public static Dictionary<String, int> PlayerScores = new Dictionary<String, int>();
            public static Dictionary<String, String[]> round2Answers = new Dictionary<String, String[]>();
            public static Dictionary<String, String> round3Answers = new Dictionary<String, String>();
            public static Dictionary<String, String> Round2Draws = new Dictionary<String, String>();
            public static Dictionary<String, String> Round3Draws = new Dictionary<String, String>(); 
            public static bool Round2DrawsDone;
            public static bool Round2AnswersDone;
            public static bool Round2ScoresDone;
            public static bool Round3DrawsDone;
            public static bool Round3AnswersDone;
            public static bool Round3ScoresDone;
            public static string[] round1Questions;
            public static List<String> round2Titles;
            public static List<String> round3Titles;
            public static string round1Question;
            public static string round2Title;
            public static string round3Title;
        }

        public void ResetGameData()
        {
            GameData.Active_games = new List<String>();
            GameData.Host = "";
            GameData.GameStarted = false;
            GameData.Round1AnswersDone = false;
            GameData.Round1ScoresDone = false;
            GameData.VotesDone = 0;
            GameData.PlayerList = new List<String>();
            GameData.round1Answers = new Dictionary<String, String>();
            GameData.PlayerScores = new Dictionary<String, int>();
            GameData.round2Answers = new Dictionary<String, String[]>();
            GameData.round3Answers = new Dictionary<String, String>();
            GameData.Round2Draws = new Dictionary<String, String>();
            GameData.Round3Draws = new Dictionary<String, String>();
            GameData.Round2DrawsDone = false;
            GameData.Round2AnswersDone = false;
            GameData.Round2ScoresDone = false;
            GameData.Round3DrawsDone = false;
            GameData.Round3AnswersDone = false;
            GameData.Round3ScoresDone = false;
            GameData.round1Question = "";
            GameData.round2Title = "";
            GameData.round3Title = "";
            GameData.round1Questions = new string[] {"Who is the most overrated untalented person you know of?",
                                        "Who is the last person you would want to be stuck in an elevator with?",
                                        "What do kangaroos really keep in their pouch?" ,
                                        "The lesser known 8th wonder of the world is...",
                                        "The new event in the upcoming olympics is...",
                                        "What is the last thing you do before going to jail?" ,
                                        "Something that you probably don’t want to buy online",
                                        "The next hit video game title",
                                        "What is a dog’s favorite movie?",
                                        "If you could have one superpower what would it be",
                                        "What is the best holiday?",
                                        "What is your best dream you have ever had?",
                                        "What is your favourite part of the day?",
                                        "What will be the cause of the world ending?",
                                        "Who is the smartest human to ever exist?",
                                        "What is the best transportation device?",
                                        "What would you do if the world was ending today?",
                                        "A major earthquake is happening, how do you act?" ,
                                         };
            GameData.round2Titles = new List<String> (){"screaming fish",
                                                    "big shrimp",
                                                    "Tiny T-Rex",
                                                    "upside down world",
                                                    "surfing with dolphins",
                                                    "just climbed Mount Everest",
                                                    "End of the rainbow",
                                                    "raining toilets",
                                                    "golfing in a thunderstorm",
                                                    "dog playing video games",
                                                    "Zoom lecture",
                                                    "cubes in space",
                                                    "cat dressed as dog",
                                                    "blueberry Kombucha",
                                                    "alien video calling"
            };
            GameData.round3Titles = new List<String>(){ "spongebob",
                                                    "shark",
                                                    "Barney",
                                                    "football",
                                                    "cookie",
                                                    "iron man",
                                                    "knight",
                                                    "calculator",
                                                    "roomba",
                                                    "Pikachu",
                                                    "Treehouse",
                                                    "popcorn",
                                                    "peanut butter",
                                                    "fish"
                                                    };
        }
        public class Player
        {
            public string playerName { get; set; }
            public string round1Answer { get; set; }

            public string round3Answer { get; set; }
            public int playerScore { get; set; }
            public string canvasSource { get; set; }
            public string[] round2FakeAnswer { get; set; }

           

        }

        public IActionResult Index()
        {
            return View();
        }

        public JsonResult SendActiveCode([FromBody] ActiveGames activegames)
        {
            //activegames is a  new model class that is stored in the model folder

            GameData.Active_games.Add(activegames.Activegames.ToString());

            return Json(new { GameData.Active_games });
        }

        public JsonResult GetActiveCode([FromBody] ActiveGames activegames)
        {
            return Json(new { GameData.Active_games });
        }

        public JsonResult AddHost([FromBody] Player player)
        {
            ResetGameData();
            GameData.Host = player.playerName.ToString();
            GameData.PlayerList.Add(GameData.Host);
            GameData.PlayerScores.Add(GameData.Host, 0);


            return Json(new { GameData.PlayerList });
        }

        public JsonResult GetHost([FromBody] Player player)
        {
            return Json(new { GameData.Host });
        }

        public JsonResult AddPlayer([FromBody] Player player)
        {
            //activegames is a  new model class that is stored in the model folder

            GameData.PlayerList.Add(player.playerName.ToString());
            GameData.PlayerScores.Add(player.playerName.ToString(),0);

            return Json(new { GameData.PlayerList });
        }

        public JsonResult GetPlayers([FromBody] Player player)
        {
            return Json(new { GameData.PlayerList });
        }

        public JsonResult WaitforStart()
        {
            return Json(new { GameData.GameStarted });
        }

        public void StartGame()
        {
            GameData.GameStarted = true;
        }

        public JsonResult getRound1Question()
        {
            if (GameData.round1Question == "")
            {
                Random r = new Random();
                int index = r.Next(0, GameData.round1Questions.Length);
                GameData.round1Question = GameData.round1Questions[index];
            }
            return Json(new { GameData.round1Question });
        }

        public JsonResult getRound2Title()
        {
            GameData.VotesDone = 0;
            Random r = new Random();
            int index = r.Next(0, GameData.round2Titles.Count);
            GameData.round2Title = GameData.round2Titles[index];
            GameData.round2Titles.RemoveAt(index);
            return Json(new { GameData.round2Title });
        }

        public JsonResult getRound3Title()
        {
            GameData.VotesDone = 0;
            Random r = new Random();
            int index = r.Next(0, GameData.round3Titles.Count);
            GameData.round3Title = GameData.round3Titles[index];
            GameData.round3Titles.RemoveAt(index);
            return Json(new { GameData.round3Title });
        }

        public JsonResult AddRound1Answer([FromBody] Player player)
        {
            GameData.round1Answers.Add(player.playerName.ToString(), player.round1Answer.ToString());
            if (GameData.round1Answers.Count == GameData.PlayerList.Count)
            {
                GameData.Round1AnswersDone = true;
            }
            return Json(new { GameData.PlayerList });
        }
        public JsonResult Round1AnswerWait()
        {
            return Json(new { GameData.Round1AnswersDone });
        }

        public JsonResult GetRound1Answers()
        {
            return Json(new { GameData.round1Answers });
        }

        public void AddScore([FromBody]Player player)
        {
            GameData.PlayerScores[player.playerName] += player.playerScore;
            GameData.VotesDone++;
            if (GameData.VotesDone == GameData.PlayerList.Count)
            {
                GameData.Round1ScoresDone = true;
            }
        }

        public void AddR2Score([FromBody]Player player)
        {
            GameData.PlayerScores[player.playerName] += player.playerScore;
            GameData.VotesDone++;
            if (GameData.VotesDone == (GameData.PlayerList.Count * GameData.PlayerList.Count * 2 ))        
            {
                GameData.Round2ScoresDone = true;
            }
        }

        public void AddR3Score([FromBody]Player player)
        {
            GameData.PlayerScores[player.playerName] += player.playerScore;


            GameData.VotesDone++;

            if (GameData.VotesDone == (GameData.PlayerList.Count*2))
            {
                GameData.Round3ScoresDone = true;
            }



        }

        public JsonResult Round1ScoreWait()
        {
            return Json(new { GameData.Round1ScoresDone });
        }

        public JsonResult Round2ScoreWait()
        {
            return Json(new { GameData.Round2ScoresDone });
        }

        public JsonResult Round3ScoreWait()
        {
            return Json(new { GameData.Round3ScoresDone });
        }

        public JsonResult AddRound2Draw([FromBody] Player player)
        {
            GameData.Round2Draws.Add(player.playerName.ToString(), player.canvasSource.ToString());
            if (GameData.Round2Draws.Count == GameData.PlayerList.Count)
            {
                GameData.Round2DrawsDone = true;
            }
            return Json(new { GameData.Round2Draws });
        }

        public JsonResult Round2DrawWait()
        {
            return Json(new { GameData.Round2DrawsDone });
        }

        public string GetRound2Draws()
        {
            var list_draws = new List<Player>();

            for (int i = 0; i < GameData.Round2Draws.Count; i++)
            {
                var cur_player = GameData.PlayerList[i];
                var player_draw = new Player();
                player_draw.playerName = cur_player;
                player_draw.canvasSource = GameData.Round2Draws[cur_player];
                list_draws.Add(player_draw);
            }

            Newtonsoft.Json.JsonSerializer json = new Newtonsoft.Json.JsonSerializer();
            StringWriter sw = new StringWriter();
            Newtonsoft.Json.JsonTextWriter writer = new JsonTextWriter(sw);
            json.Serialize(writer, list_draws);
            string output = sw.ToString();
            writer.Close();
            sw.Close();

            return output;

        }

        public JsonResult AddRound2Answer([FromBody] Player player)
        {

            GameData.round2Answers.Add(player.playerName.ToString(), player.round2FakeAnswer);
            if (GameData.round2Answers.Count == GameData.PlayerList.Count)
            {
                GameData.Round2AnswersDone = true;
            }
            return Json(new { GameData.round2Answers });
        }

        public JsonResult Round2FakeAnswerWait()
        {
            return Json(new { GameData.Round2AnswersDone });
        }

        public JsonResult GetRound2Answers()
        {
            return Json(new { GameData.round2Answers});
        }

        public JsonResult GetScores()
        {
            return Json(new { GameData.PlayerScores });
        }


        public JsonResult AddRound3Draw([FromBody] Player player)
        {
            GameData.Round3Draws.Add(player.playerName.ToString(), player.canvasSource.ToString());
            if (GameData.Round3Draws.Count == GameData.PlayerList.Count)
            {
                GameData.Round3DrawsDone = true;
            }
            return Json(new { GameData.Round3Draws });
        }

        public JsonResult Round3DrawWait()
        {
            return Json(new { GameData.Round3DrawsDone });
        }

        public JsonResult AddRound3Answer([FromBody] Player player)
        {

            GameData.round3Answers.Add(player.playerName.ToString(), player.round3Answer.ToString());
            
            return Json(new { GameData.round3Answers });
        }

        public JsonResult GetRound3Answers()
        {
            return Json(new { GameData.round3Answers });
        }

        public string GetRound3Draws()
        {
            var list_draws = new List<Player>();

            for (int i = 0; i < GameData.Round3Draws.Count; i++)
            {
                var cur_player = GameData.PlayerList[i];
                var player_draw = new Player();
                player_draw.playerName = cur_player;
                player_draw.canvasSource = GameData.Round3Draws[cur_player];
                list_draws.Add(player_draw);
            }

            Newtonsoft.Json.JsonSerializer json = new Newtonsoft.Json.JsonSerializer();
            StringWriter sw = new StringWriter();
            Newtonsoft.Json.JsonTextWriter writer = new JsonTextWriter(sw);
            json.Serialize(writer, list_draws);
            string output = sw.ToString();
            writer.Close();
            sw.Close();

            return output;

        }

       


        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }
        public IActionResult Game()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }


    
}
