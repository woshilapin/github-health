setwd(file.path(getwd(), ".."));
source("r/Rinit");

year <- year(data.pulls$created_at);
month <- month(data.pulls$created_at);

pr_number_over_time.month <- aggregate(created_at ~ month + year, data.pulls, FUN=length);
row.names(pr_number_over_time.month) <- paste(pr_number_over_time.month$month, pr_number_over_time.month$year);
pr_number_over_time.month <- pr_number_over_time.month[, c(3)];
png(filename="graphics/number-of-pull-requests-over-time.month.png", width=800, height=600, units="px");
month.plot <- barplot(pr_number_over_time.month, names.arg=unique(paste(month, year)), ylim=c(0,100), main="Number of Pull Requests over months", legend=c("# of Pull Requests"));
text(month.plot, pr_number_over_time.month, label=pr_number_over_time.month, col="blue", pos=3, offset=.5);

isxwikisas <- function(data) {
	return(table(data)["TRUE"]);
}
isexternal <- function(data) {
	return(table(data)["FALSE"]);
}

xwikisas.pr_number_over_time.year <- aggregate(is_xwikisas ~ year, data.pulls, FUN=isxwikisas);
external.pr_number_over_time.year <- aggregate(is_xwikisas ~ year, data.pulls, FUN=isexternal);
pr_number_over_time.year <- cbind(xwikisas.pr_number_over_time.year, external.pr_number_over_time.year);
years <- pr_number_over_time.year$year;
pr_number_over_time.year
pr_number_over_time.year <- pr_number_over_time.year[, c(2,4)];
names(pr_number_over_time.year) <- c("xwikisas", "external");
row.names(pr_number_over_time.year) <- years;
pr_number_over_time.year <- t(pr_number_over_time.year);
pr_number_over_time.year

png(filename="graphics/number-of-pull-requests-over-time.year.png", width=800, height=600, units="px");
year.plot <- barplot(pr_number_over_time.year, beside=TRUE, ylim=c(0,300), main="Number of Pull Requests over year", legend=c("XWiki SAS Pull Requests", "External Pull Requests"));
total <- pr_number_over_time.year[1,] + pr_number_over_time.year[2,];
total <- t(cbind(total, total));
percentage.year <- paste(100 * round(pr_number_over_time.year / total, 3), " %");
text(year.plot, pr_number_over_time.year, label=percentage.year, col="blue", pos=3, offset=.5);
dev.off();
