setwd(file.path(getwd(), ".."));
source("r/Rinit");

year <- year(data.pulls$created_at);
month <- month(data.pulls$created_at);

pr_number_over_time.month <- aggregate(created_at ~ month + year, data.pulls, FUN=length);
pr_number_over_time.year <- aggregate(created_at ~ year, data.pulls, FUN=length);
row.names(pr_number_over_time.month) <- paste(pr_number_over_time.month$month, pr_number_over_time.month$year);
row.names(pr_number_over_time.year) <- pr_number_over_time.year$year;
pr_number_over_time.month <- pr_number_over_time.month[, c(3)];
pr_number_over_time.year <- pr_number_over_time.year[, c(2)];
png(filename="graphics/number-of-pull-requests-over-time.month.png", width=800, height=600, units="px");
month.plot <- barplot(pr_number_over_time.month, names.arg=unique(paste(month, year)), ylim=c(0,55), main="Number of Pull Requests over months", legend=c("# of Pull Requests"));
text(month.plot, pr_number_over_time.month, label=pr_number_over_time.month, col="blue", pos=3, offset=.5);
png(filename="graphics/number-of-pull-requests-over-time.year.png", width=800, height=600, units="px");
year.plot <- barplot(pr_number_over_time.year, names.arg=unique(year), ylim=c(0,220), main="Number of Pull Requests over year", legend=c("# of Pull Requests"));
text(year.plot, pr_number_over_time.year, label=pr_number_over_time.year, col="blue", pos=3, offset=.5);
dev.off();
