library(readr)
library(dplyr)
Scoring <- read_csv("Scoring.csv") 
Scoring[is.na(Scoring)] <- 0
Teams <- read_csv("Teams.csv")
Teams[is.na(Teams)] <- 0
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
