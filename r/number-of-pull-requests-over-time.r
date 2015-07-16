setwd(file.path(getwd(), ".."));
source("r/Rinit");

year <- year(data.pulls$created_at);
month <- month(data.pulls$created_at);

pr_number_over_time.month <- aggregate(created_at ~ month + year, data.pulls, FUN=length);
pr_number_over_time.year <- aggregate(created_at ~ year, data.pulls, FUN=length);
png(filename="graphics/number-of-pull-requests-over-time.month.png", width=800, height=600, units="px");
barplot(pr_number_over_time.month$created_at);
png(filename="graphics/number-of-pull-requests-over-time.year.png", width=800, height=600, units="px");
barplot(pr_number_over_time.year$created_at);
dev.off();
