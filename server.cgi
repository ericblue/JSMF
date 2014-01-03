#!/usr/bin/perl
# JSMF - JavaScript State Management Framework
# $Id: server.cgi,v 1.1 2004-10-03 02:03:18 eblue Exp $ 

use CGI;
use Data::Dumper;

my $query = new CGI;
my $action = $query->param('action');
if (!defined($action)) {
    $action = $query->url_param('action');
}

print "Content-type: text/html\n\n";

if ($action eq "init" ) {

    print qq{<html><body><form>};

    my @pairs = split(/\s+/,$query->param('hash'));
    foreach (@pairs) {
        my ($name,$value) = split(/,/,$_);
        print qq{
        $name <input type="text" name="$name" value="$value"><br>
        };
    }

    print qq{</form></body></html>};

}

if ($action eq "freeze" ) {

    my %variables;

    foreach my $key ( $query->param ) {
        next if $key eq "action";
        $variables{$key} = $query->param($key);
    }

    my $dumper = Data::Dumper->new([\%variables]);
    $dumper->Names(["variables"]);

    open(OUT,">variables.out") or die "Can't freeze to file!";
    print OUT $dumper->Dump();
    close(OUT);

    print qq{
      <html><body>
      freeze: SUCCESS <br>
      <small>Click Back to continue testing</small>
      <form>
      <input type="button" value="<< Back"
        onClick="javascript:history.back()">
      </body></html>
    };

}

if ($action eq "thaw" ) {

    open(IN,"variables.out") or die "Can't thaw from file!";
    undef $/; 
    eval <IN>;
    close(IN);

    print qq{<html><body><form>};

    foreach (keys(%{$variables})) {
        my $name = $_;
        my $value = $variables->{$_};
        print qq{
        $name <input type="text" name="$name" value="$value"><br>
        };
    }

    print qq{</form>thaw: SUCCESS</body></html>};


}

