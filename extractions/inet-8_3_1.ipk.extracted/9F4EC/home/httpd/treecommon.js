//each node in the tree is an Array with 7+n positions
//  node[0] is 0/1 when the node is closed/open
//  node[1] is 0/1 when the folder is closed/open
//  node[2] is 1 if the children of the node are documents
//  node[3] is 0/1 when node is leaf node/folder node
//  node[4] is index num fo foldersTreeArray
//  node[5] is the name of the folder
//  node[6] is the link for the folder
//  node[7]...node[7+n] are the n children nodes

var foldersTreeArray;
foldersTreeArray = new Array;
var timeOutId = 0;

var LASTNODE_ICON     = "../images/lastnode.png";
var NODE_ICON         = "../images/node.png";
var DOC_ICON          = "../images/doc.png";
var LINK_ICON         = "../images/link.png";
var LOGO_ICON         = "../images/logo.png";
var BLANK_ICON        = "../images/blank.png";
var VERTLINE_ICON     = "../images/vertline.png";
var OPENFOLDER_ICON   = "../images/openfolder.png";
var CLOSEDFOLDER_ICON = "../images/closedfolder.png";
var RADIO_ICON        = "../images/radio.png";
var BGCOLOR           = "#FFFFCC"


// Auxiliary function to build the node
function folderNode(num, name, link)
{
    var arrayAux;
    arrayAux = new Array;
    arrayAux[0] = 0;
    arrayAux[1] = 0;
    arrayAux[2] = 0;
	arrayAux[3] = 1;
	arrayAux[4] = num;
    arrayAux[5] = name;
	arrayAux[6] = link;

    return arrayAux;
}

// Auxiliary function to build the node
// The entries in arrayAux[7]..array[length-1] are strings built in generate doc entry
function leafNode(num, name, link)
{
    var arrayAux;
    arrayAux = new Array;
    arrayAux[0] = 0;
    arrayAux[1] = 0;
    arrayAux[2] = 1;
	arrayAux[3] = 0;
	arrayAux[4] = num;
    arrayAux[5] = name;
	arrayAux[6] = link;

    return arrayAux;
}

//this way the generate tree function becomes simpler and less error prone
function appendChild(parent, child)
{
    parent[parent.length] = child;
    return child;
}

//these are the last entries in the hierarchy, the local and remote links to html documents
function generateDocEntry(icon, docDescription, link)
{
    var retString ="";
    var szDoc ="";
    if (icon==0)
    {
        //New System with display of docs but w/o links
        retString = "<IMG SRC='" + DOC_ICON + "' ALT='Opens in right frame'</TD>\n";
        szDoc = docDescription;
    }
    else if (icon==1)
    {
		//New System with doc link as a second type
        retString = "<A HREF='"+link+"' TARGET=folderFrame><IMG SRC='" + DOC_ICON + "' ALT='Opens in right frame' border=0></A></TD>\n";
        szDoc = "<A HREF='" + link + "' TARGET=folderFrame>" + docDescription + "</A>";
    }
    else
    {
        //Old System with external linik as other type
        retString = "<A HREF='http://"+link+"' TARGET=_blank><IMG SRC='" + LINK_ICON + "' ALT='Opens in new window' border=0></A></TD>\n";
        szDoc = "<A HREF='" + link + "' TARGET=_blank>" + docDescription + "</A>";
    }
    retString = retString + "<TD NOWRAP><FONT SIZE='-1' FACE='Arial, Helvetica'>" + szDoc + "</FONT>\n";

    return retString;
}


// **********************
// display functions

//help window
function treeHelp()
{
	var newWindow;
	
	newWindow = window.open("","helpWindow","height=125,width=225,scrollbars=0,resizable=0");
	newWindow.document.clear();
	newWindow.document.write("<HTML>\n<HEAD><TITLE>Navagation Tree Help</TITLE></HEAD>\n<BODY BGCOLOR='" + BGCOLOR + "'>\n");
	newWindow.document.write("Click the Radio or Folder icon<BR>\n");
	newWindow.document.write("to expand or collapse the tree.<BR><BR>\n");
	newWindow.document.write("Click on the Name to open that<BR>\n");
	newWindow.document.write("link in the main frame.<BR>\n");
	newWindow.document.write("</BODY>\n</HTML>\n");
	newWindow.document.close();
}

//redraws the left frame
function redrawTree()
{
	var cnt;
    var doc = top.treeFrame.window.document;

    doc.clear();
	doc.write("<HTML>\n<HEAD>\n</HEAD>\n");
    doc.write("<BODY BGCOLOR='" + BGCOLOR + "'>\n");
    doc.write("<CENTER><IMG SRC='" + LOGO_ICON + "' BORDER='0'></CENTER><BR>\n");
	for(cnt=0; cnt < foldersTreeArray.length; cnt++)
	{
    	redrawNode(foldersTreeArray[cnt], doc, 0, 1, "");
		doc.write("<BR>\n");
	}
	
	doc.write("<A HREF='JavaScript:top.treeHelp();'><FONT SIZE=-2>Help</FONT></A>\n");
	doc.write("</BODY>\n</HTML>\n");
    doc.close();
}

//recursive function over the tree structure called by redrawTree
function redrawNode(foldersNode, doc, level, lastNode, leftSide)
{
    var j=0;
    var i=0;

    doc.write("\n<TABLE BORDER='0' CELLSPACING='0' CELLPADDING='0'>\n");
    doc.write("<TR>\n<TD VALIGN='middle' NOWRAP>");

    doc.write(leftSide);

    if (level>0)
	{
        if (lastNode) //the last 'brother' in the children array
        {
            doc.write("<IMG SRC='" + LASTNODE_ICON + "' WIDTH='16' HEIGHT='22'>");
            leftSide = leftSide + "<IMG SRC='" + BLANK_ICON + "' WIDTH='16' HEIGHT='22'>";
		}
        else
        {
            doc.write("<IMG SRC='" + NODE_ICON + "' WIDTH='16' HEIGHT='22'>");
            leftSide = leftSide + "<IMG SRC='" + VERTLINE_ICON + "' WIDTH='16' HEIGHT='22'>";
        }
	}

    displayIconAndLabel(foldersNode, doc);
	doc.write("</TR>\n");
	doc.write("</TABLE>\n");

    if (foldersNode.length > 7 && foldersNode[0]) //there are sub-nodes and the folder is open
    {
        if (!foldersNode[2]) //for folders with folders
        {
            level=level+1;
            for (i=7; i<foldersNode.length;i++)
			{
                if (i==foldersNode.length-1)
				{
                    redrawNode(foldersNode[i], doc, level, 1, leftSide);
				}
                else
				{
                    redrawNode(foldersNode[i], doc, level, 0, leftSide);
				}
			}
        }
        else //for folders with documents
        {
			doc.write("\n<TABLE BORDER='0' CELLSPACING='0' CELLPADDING='0'>\n");
            for (i=7; i<foldersNode.length;i++)
			{
                doc.write("<TR>\n<TD NOWRAP>");
                doc.write(leftSide);
                if (i==foldersNode.length - 1)
				{
                    doc.write("<IMG SRC='" + LASTNODE_ICON + "' WIDTH='16' HEIGHT='22'>");
				}
                else
				{
                    doc.write("<IMG SRC='" + NODE_ICON + "' WIDTH='16' HEIGHT='22'>");
				}
                doc.write(foldersNode[i]);
				doc.write("</TR>\n");
            }
			doc.write("</TABLE>\n");
        }
    }
}

//builds the html code to display a folder and its label
function displayIconAndLabel(foldersNode, doc)
{
    var szOpenIconName = OPENFOLDER_ICON;
    var szCloseIconName = CLOSEDFOLDER_ICON;
	if (foldersNode[3] == 1)
	{
		szOpenIconName = RADIO_ICON;
		szCloseIconName = RADIO_ICON;
	}
    //doc.write("<A HREF='" + foldersNode[6] + "' TARGET=folderFrame onClick='JavaScript:top.openBranch(\"" + foldersNode[4] + "." + foldersNode[5] + "\")'><IMG SRC=");
	doc.write("<A TARGET=folderFrame HREF='JavaScript:top.openBranch(\"" + foldersNode[4] + "." + foldersNode[5] + "\")'><IMG SRC=");
	
    if (foldersNode[1])
	{
      doc.write("'" + szOpenIconName + "' WIDTH='22' HEIGHT='22' BORDER='0'></A></TD>\n");
	}
    else
	{
      doc.write("'" + szCloseIconName + "' WIDTH='22' HEIGHT='22' BORDER='0'></A></TD>\n");
	}
    doc.write("<TD VALIGN='middle' ALIGN='left' NOWRAP>");
    //doc.write("<A HREF='" + foldersNode[6] + "' TARGET=folderFrame onClick='JavaScript:top.openBranch(\"" + foldersNode[4] + "." + foldersNode[5] + "\")'>");
	doc.write("<A HREF='" + foldersNode[6] + "' TARGET=folderFrame>");
    doc.write("<FONT SIZE='-1' FACE='Arial, Helvetica'>"+foldersNode[5]+"</FONT></A></TD>\n");
}

//**********************+
// Recursive functions

//when a parent is closed all children also are
function closeFolders(foldersNode)
{
    var i=0;
	
    if (!foldersNode[2])
    {
        for (i=7; i< foldersNode.length; i++)
		{
            closeFolders(foldersNode[i]);
		}
    }
    foldersNode[0] = 0;
    foldersNode[1] = 0;
}

//recursive over the tree structure
//called by openbranch
function clickOnFolderRec(foldersNode, folderName)
{
    var i=0;
    if (folderName == (foldersNode[4] + "." + foldersNode[5]) )
    {
        if (foldersNode[0])
		{
            closeFolders(foldersNode);
		}
        else
        {
            foldersNode[0] = 1;
            foldersNode[1] = 1;
        }
    }
    else
    {
        if (!foldersNode[2])
		{
            for (i=7; i< foldersNode.length; i++)
			{
                clickOnFolderRec(foldersNode[i], folderName);
			}
		}
    }
}


// ********************
// Event handlers

//called when the user clicks on a folder
function openBranch(branchName)
{
	var cnt;

	for(cnt=0; cnt<foldersTreeArray.length; cnt++)
	{
	    clickOnFolderRec(foldersTreeArray[cnt], branchName);
	}

    timeOutId = setTimeout("redrawTree()",100);
}

//called after this html file is loaded
function initializeTree()
{
	var cnt;
	
    generateTree();
    redrawTree();
	for(cnt=0; cnt<foldersTreeArray.length; cnt++)
	{
	    openBranch(foldersTreeArray[cnt][4] + "." + foldersTreeArray[cnt][5]);
	}
}

generateTree(); //sometimes when the user reloads the document Netscape 3.01 does not trigger the onLoad event (!!)
