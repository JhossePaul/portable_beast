require(jsonlite)

output <- function (json) {
  input <- fromJSON(json)
  rnorm(input$n)
}
