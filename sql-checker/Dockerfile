FROM openjdk:10-jre
MAINTAINER Benjamin Manns <benjamin.manns@mni.thm.de>
ADD build/install/sql-checker /usr/local/sql-checker
VOLUME /upload-dir
VOLUME /usr/local/appconfig/application.config
WORKDIR /usr/local/sql-checker/bin
ENTRYPOINT ["./sql-checker"]