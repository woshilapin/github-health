setwd(file.path(getwd(), ".."));
source("r/Rinit");

data.externals <- data.pulls[!data.pulls$is_xwikisas, ];

year <- year(data.externals$created_at);

merged <- aggregate(merged ~ year, data.externals, FUN=trues);
rejected <- aggregate(rejected ~ year, data.externals, FUN=trues);
opened <- aggregate(closed ~ year, data.externals, FUN=falses);
pr <- data.frame(merged=merged$merged, rejected=rejected$rejected, opened=opened$closed);
row.names(pr) <- merged$year;
pr <- t(pr);
pr[is.na(pr)] <- 0
total <- pr[1,] + pr[2,] + pr[3,];
total <- t(cbind(total, total, total));
percentage <- paste(100 * round(pr / total, 3), "%");
png(filename="graphics/number-of-detailed-pull-requests-over-time.year.png", width=1000, height=600, units="px");
prplot <- barplot(pr, beside=TRUE, ylim=c(0,25), main="Number of Pull Requests merged/rejected/open over years (contributors outside XWiki SAS)", legend=c("merged", "rejected", "open"));
text(prplot, pr, label=percentage, col="blue", pos=3, offset=.5);
dev.off();
