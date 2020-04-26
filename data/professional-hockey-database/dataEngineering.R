library(readr)
library(dplyr)
Scoring <- read_csv("Scoring.csv") 
Scoring[is.na(Scoring)] <- 0
Teams <- read_csv("Teams.csv")
Teams[is.na(Teams)] <- 0
Master <- read_csv("Master.csv")

scoring <- Scoring %>%
  group_by(year) %>%
  summarise(goals = sum(G)
            , assists = sum(A)
            , points = sum(Pts))

teams <- Teams %>%
  group_by(year) %>%
  summarise(games = sum(G))

combined <- merge(teams, scoring)

final_df <- combined %>%
  mutate(goalsPerGame = round(goals/games, digits = 2)
         , assistsPerGame = round(assists/games, digits = 2)
         , pointsPerGAme = round(points /games, digits = 2))
write_csv(final_df, "gameScoring.csv")

# Variable # Value
top_players <- merge(Master, Scoring)
top_five_players <- top_players %>%

  select(playerID, GP, G, A, Pts, PIM, plusMinus = `+/-`, PostG, PostGP, SOG, firstNHL, lastNHL) 

summary <- top_players %>%
  select(playerID, GP, G, A, Pts, PIM, plusMinus = `+/-`, PostG, PostGP, SOG, firstNHL, lastNHL) %>%
  group_by(playerID)  %>%
  summarise(GP = sum(GP), G = sum(G), A = sum(A), Pts = sum(Pts), PIM = sum(PIM), plusMinus = sum(plusMinus)) %>%
  filter(playerID=="orrbo01")

gamesPlayed <- summary$GP
goals <- summary$G
assists <- summary$A
points <- summary$Pts
plusMinus <- summary$plusMinus

data <- data.frame(values = c(gamesPlayed, goals, assists, points, plusMinus), labels = c("Games Played", "Goals", "Assists", "Points", "Plus Minus"))

