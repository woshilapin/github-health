setwd(file.path(getwd(), ".."));
source("r/Rinit");

year <- year(data.commits$created_at);
month <- month(data.commits$created_at);

commits_number_over_time.month <- aggregate(created_at ~ month + year, data.commits, FUN=length);
commits_number_over_time.year <- aggregate(created_at ~ year, data.commits, FUN=length);
png(filename="graphics/number-of-commits-over-time.month.png", width=800, height=600, units="px");
barplot(commits_number_over_time.month$created_at);
png(filename="graphics/number-of-commits-over-time.year.png", width=800, height=600, units="px");
barplot(commits_number_over_time.year$created_at);
dev.off();
