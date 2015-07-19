setwd(file.path(getwd(), ".."));
source("r/Rinit");

year <- year(data.pulls$created_at);
month <- month(data.pulls$created_at);

accepted <- function(data) {
	return(table(data)["FALSE"]);
}
rejected <- function(data) {
	return(table(data)["TRUE"]);
}

accepted_pr_number_over_time.month <- aggregate(rejected ~ month + year, data.pulls, FUN=accepted);
accepted_pr_number_over_time.year <- aggregate(rejected ~ year, data.pulls, FUN=accepted);
rejected_pr_number_over_time.month <- aggregate(rejected ~ month + year, data.pulls, FUN=rejected);
rejected_pr_number_over_time.year <- aggregate(rejected ~ year, data.pulls, FUN=rejected);
pr_number_over_time.month <- cbind(accepted_pr_number_over_time.month, rejected_pr_number_over_time.month);
pr_number_over_time.year <- cbind(accepted_pr_number_over_time.year, rejected_pr_number_over_time.year);
names(pr_number_over_time.month) <- c("month", "year", "accepted", "month", "year", "rejected")
names(pr_number_over_time.year) <- c("year", "accepted", "year", "rejected")
row.names(pr_number_over_time.month) <- paste(pr_number_over_time.month$month, pr_number_over_time.month$year);
row.names(pr_number_over_time.year) <- pr_number_over_time.year$year;
pr_number_over_time.month <- pr_number_over_time.month[, c(3,6)];
pr_number_over_time.year <- pr_number_over_time.year[, c(2,4)];
pr_number_over_time.month <- t(pr_number_over_time.month);
pr_number_over_time.year <- t(pr_number_over_time.year);
png(filename="graphics/number-of-rejected-pull-requests-over-time.month.png", width=800, height=600, units="px");
month.plot <- barplot(pr_number_over_time.month, beside=TRUE, ylim=c(0,100), legend=c("merged", "rejected"));
text(month.plot, pr_number_over_time.month, label=pr_number_over_time.month, col="blue", pos=3, offset=.5);
png(filename="graphics/number-of-rejected-pull-requests-over-time.year.png", width=800, height=600, units="px");
year.plot <- barplot(pr_number_over_time.year, beside=TRUE, ylim=c(0,300), legend=c("merged", "rejected"));
text(year.plot, pr_number_over_time.year, label=pr_number_over_time.year, col="blue", pos=3, offset=.5);
dev.off();
