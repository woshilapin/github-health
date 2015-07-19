setwd(file.path(getwd(), ".."));
source("r/Rinit");

data.externals <- data.commits[!data.commits$is_xwikisas, ];

year <- year(data.commits$created_at);

commits <- aggregate(created_at ~ year, data.commits, FUN=length);
years <- commits$year;
commits <- data.frame(number=commits$created_at);
row.names(commits) <- years;
commits <- t(commits);
png(filename="graphics/number-of-external-commits-over-time.png", width=1000, height=600, units="px");
commitplot <- barplot(commits, ylim=c(0,4500), main="Number of commits (contributors outside XWiki SAS)");
text(commitplot, commits, label=commits, col="blue", pos=3, offset=.5);
dev.off();
