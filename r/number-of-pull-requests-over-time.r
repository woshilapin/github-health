source("Rinit");

year <- year(data.pulls$created_at);
month <- month(data.pulls$created_at);

pr_number_over_time <- aggregate(created_at ~ month + year, data.pulls, FUN=length);
png(filename="graphics/number-of-pull-requests-over-time.png", width=800, height=600, units="px");
barplot(pr_number_over_time$created_at);
dev.off();
